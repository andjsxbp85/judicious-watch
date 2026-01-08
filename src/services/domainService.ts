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
} from "@/types/domainTypes";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map API domain status to frontend status format
 */
function mapStatus(status: DomainItem["status"]): FrontendDomain["status"] {
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
 * Map API crawl history item to frontend format
 */
function mapCrawlToFrontend(item: CrawlHistoryItem): FrontendCrawlItem {
  const screenshot =
    item.screenshot && item.screenshot.trim() !== ""
      ? item.screenshot.startsWith("data:image")
        ? item.screenshot
        : `data:image/png;base64,${item.screenshot}`
      : "/screenshots/placeholder.png";

  return {
    crawl_id: item.crawl_id,
    url: item.url,
    timestamp: item.timestamp,
    status: mapStatus(item.status),
    confidenceScore: item.confidence_score,
    reasoning: item.reasoning || "",
    innerText: item.inner_text,
    screenshot,
    isAmp: item.is_amp,
  };
}

/**
 * Map API domain item to frontend domain format
 */
export function mapDomainToFrontend(item: DomainItem): FrontendDomain {
  const screenshot =
    item.screenshot && item.screenshot.trim() !== ""
      ? item.screenshot.startsWith("data:image")
        ? item.screenshot
        : `data:image/png;base64,${item.screenshot}`
      : "/screenshots/placeholder.png";

  // Extract first URL from array, or empty string if array is empty/undefined
  const url = Array.isArray(item.url) && item.url.length > 0 ? item.url[0] : "";

  return {
    id: item.id,
    domain_id: parseInt(item.id) || 0,
    domain: item.domain,
    url,
    status: mapStatus(item.status),
    confidenceScore: item.confidenceScore,
    screenshot,
    reasoning: item.reasoning,
    verifiedBy: item.verifiedBy,
    timestamp_latest: item.timestamp_latest,
    crawl_id: item.crawl_id,
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
};
