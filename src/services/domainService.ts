import ENDPOINTS from "@/constants/endpoint";
import { apiClient } from "@/lib/apiClient";
import type {
  GetDomainsParams,
  GetDomainsResponse,
  DomainItem,
  FrontendDomain,
  DomainDetailResponse,
  CrawlHistoryItem,
  FrontendCrawlItem,
  FrontendDomainDetail,
  DomainStatus,
  UpdateDomainStatusRequest,
  UpdateDomainStatusResponse,
  SendToLLMResponse,
} from "@/types/domainTypes";

// Re-export types for consumers
export type {
  DomainStatus,
  ReasoningFilter,
  SortBy,
  SortOrder,
  GetDomainsParams,
  DomainItem,
  GetDomainsResponse,
  FrontendDomain,
  CrawlHistoryItem,
  DomainDetailResponse,
  FrontendCrawlItem,
  FrontendDomainDetail,
  UpdateDomainStatusRequest,
  UpdateDomainStatusResponse,
  SendToLLMResponse,
} from "@/types/domainTypes";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map API domain status to frontend status format (for crawl items)
 */
function mapCrawlStatus(status: DomainStatus): FrontendCrawlItem["status"] {
  switch (status) {
    case "judol":
      return "judol";
    case "non_judol":
      return "non-judol";
    case "not_verified":
    default:
      return "not-verified";
  }
}

/**
 * Convert base64 screenshot to data URL format
 * Handles both raw base64 and already-formatted data URLs
 * Returns 404 placeholder if screenshot is not valid base64 format
 */
function formatScreenshot(screenshot: string | null): string {
  if (!screenshot || screenshot.trim() === "") {
    return "/screenshots/placeholder.png";
  }

  // Already a data URL - valid
  if (screenshot.startsWith("data:image")) {
    return screenshot;
  }

  // Check for valid base64 image headers
  // JPEG starts with /9j/, PNG starts with iVBOR, GIF starts with R0lGO, WebP starts with UklGR
  const isValidBase64 =
    screenshot.startsWith("/9j/") ||
    screenshot.startsWith("iVBOR") ||
    screenshot.startsWith("R0lGO") ||
    screenshot.startsWith("UklGR");

  if (!isValidBase64) {
    // Not a valid base64 image - return 404 placeholder
    return "/screenshots/404-not-found.svg";
  }

  // Detect image type from base64 header
  let mimeType = "image/png"; // default
  if (screenshot.startsWith("/9j/")) {
    mimeType = "image/jpeg";
  } else if (screenshot.startsWith("R0lGO")) {
    mimeType = "image/gif";
  } else if (screenshot.startsWith("UklGR")) {
    mimeType = "image/webp";
  }

  return `data:${mimeType};base64,${screenshot}`;
}

/**
 * Map API crawl history item to frontend format
 */
function mapCrawlToFrontend(item: CrawlHistoryItem): FrontendCrawlItem {
  return {
    crawl_id: item.crawl_id,
    url: item.url,
    timestamp: item.timestamp,
    status: mapCrawlStatus(item.status),
    confidenceScore: item.confidence_score,
    reasoning: item.reasoning || "",
    innerText: item.inner_text,
    screenshot: formatScreenshot(item.screenshot),
    isAmp: item.is_amp,
  };
}

/**
 * Map a single status value from API format to frontend format
 */
function mapSingleStatus(status: DomainStatus): FrontendDomain["status"] {
  switch (status) {
    case "judol":
      return "judol";
    case "non_judol":
      return "non-judol";
    case "not_verified":
    default:
      return "not-verified";
  }
}

/**
 * Map API domain item to frontend domain format
 * Handles new array-based structure for url, status, confidenceScore, screenshot, verifiedBy
 */
export function mapDomainToFrontend(item: DomainItem): FrontendDomain {
  // Get first values for primary display
  const url = Array.isArray(item.url) && item.url.length > 0 ? item.url[0] : "";
  const firstStatus =
    Array.isArray(item.status) && item.status.length > 0
      ? item.status[0]
      : ("not_verified" as DomainStatus);
  const firstScore =
    Array.isArray(item.confidenceScore) && item.confidenceScore.length > 0
      ? item.confidenceScore[0]
      : 0;
  const firstScreenshot =
    Array.isArray(item.screenshot) && item.screenshot.length > 0
      ? item.screenshot[0]
      : null;
  const firstVerifiedBy =
    Array.isArray(item.verifiedBy) && item.verifiedBy.length > 0
      ? item.verifiedBy[0]
      : null;

  // Map all statuses to frontend format
  const statuses = Array.isArray(item.status)
    ? item.status.map(mapSingleStatus)
    : ["not-verified" as const];

  return {
    id: item.id,
    domain: item.domain,
    url,
    urls: item.url || [],
    status: mapSingleStatus(firstStatus),
    statuses,
    confidenceScore: firstScore,
    confidenceScores: item.confidenceScore || [],
    screenshot: formatScreenshot(firstScreenshot),
    screenshots: item.screenshot || [],
    verifiedBy: firstVerifiedBy,
    verifiedBys: item.verifiedBy || [],
    urlCount: item.url?.length || 0,
  };
}

// ============================================
// DOMAIN SERVICE
// ============================================

export const domainService = {
  /**
   * Get domains with filtering and pagination
   * @param params - Query parameters for filtering, pagination, and sorting
   * @returns Promise with paginated domain data
   */
  async getDomains(params: GetDomainsParams = {}): Promise<GetDomainsResponse> {
    // Build query string from params
    const queryParams = new URLSearchParams();

    if (params.search) {
      queryParams.append("search", params.search);
    }
    if (params.status && params.status !== "all") {
      queryParams.append("status", params.status);
    }
    if (params.min_score !== undefined) {
      queryParams.append("min_score", params.min_score.toString());
    }
    if (params.max_score !== undefined) {
      queryParams.append("max_score", params.max_score.toString());
    }
    if (params.reasoning && params.reasoning !== "all") {
      queryParams.append("reasoning", params.reasoning);
    }
    if (params.verifikator) {
      queryParams.append("verifikator", params.verifikator);
    }
    if (params.page !== undefined) {
      queryParams.append("page", params.page.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params.sort_by) {
      queryParams.append("sort_by", params.sort_by);
    }
    if (params.order) {
      queryParams.append("order", params.order);
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `${ENDPOINTS.GET_DOMAINS}?${queryString}`
      : ENDPOINTS.GET_DOMAINS;

    return apiClient(url, {
      method: "GET",
    });
  },

  /**
   * Get domains and map to frontend format
   * @param params - Query parameters
   * @returns Promise with frontend-formatted domain data
   */
  async getDomainsForFrontend(params: GetDomainsParams = {}): Promise<{
    domains: FrontendDomain[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await this.getDomains(params);

    return {
      domains: response.data.map(mapDomainToFrontend),
      total: response.total,
      page: response.page,
      limit: response.limit,
    };
  },

  /**
   * Get domain detail with crawl history
   * @param domainId - The domain ID to fetch details for
   * @returns Promise with domain detail response
   */
  async getDomainDetail(domainId: string): Promise<DomainDetailResponse> {
    return apiClient(ENDPOINTS.GET_DOMAIN_DETAIL(domainId), {
      method: "GET",
    });
  },

  /**
   * Get domain detail and map to frontend format
   * @param domainId - The domain ID to fetch details for
   * @returns Promise with frontend-formatted domain detail
   */
  async getDomainDetailForFrontend(
    domainId: string
  ): Promise<FrontendDomainDetail> {
    const response = await this.getDomainDetail(domainId);

    return {
      domainId: response.domain_id,
      domainName: response.domain_name,
      crawls: response.crawls.map(mapCrawlToFrontend),
    };
  },

  /**
   * Update domain status
   * @param domainId - The domain ID to update
   * @param status - The new status (judol, non_judol, not_verified)
   * @returns Promise with update response
   */
  async updateDomainStatus(
    domainId: string,
    status: DomainStatus
  ): Promise<UpdateDomainStatusResponse> {
    const body: UpdateDomainStatusRequest = { status };
    return apiClient(ENDPOINTS.UPDATE_DOMAIN_STATUS(domainId), {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /**
   * Send a domain to LLM for AI reasoning/inference
   * @param domain - The domain name to process
   * @returns Promise with LLM inference response
   */
  async sendToLLM(domain: string): Promise<SendToLLMResponse> {
    return apiClient(ENDPOINTS.SEND_TO_LLM, {
      method: "POST",
      body: JSON.stringify({ domain }),
    });
  },

  /**
   * Send multiple domains to LLM for AI reasoning/inference (sequential processing)
   * @param domains - Array of domain names to process
   * @param onProgress - Optional callback for progress updates
   * @returns Promise with array of results
   */
  async sendBulkToLLM(
    domains: string[],
    onProgress?: (current: number, total: number, domain: string) => void
  ): Promise<
    { domain: string; result: SendToLLMResponse | null; error: string | null }[]
  > {
    const results: {
      domain: string;
      result: SendToLLMResponse | null;
      error: string | null;
    }[] = [];

    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      onProgress?.(i + 1, domains.length, domain);

      try {
        const result = await this.sendToLLM(domain);
        results.push({ domain, result, error: null });
      } catch (err) {
        const error = err instanceof Error ? err.message : "Unknown error";
        results.push({ domain, result: null, error });
      }
    }

    return results;
  },
};
