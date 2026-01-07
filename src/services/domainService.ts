import ENDPOINTS from "@/constants/endpoint";
import { apiClient } from "@/lib/apiClient";
import type {
  GetDomainsParams,
  GetDomainsResponse,
  DomainItem,
  FrontendDomain,
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
 * Map API domain item to frontend domain format
 */
export function mapDomainToFrontend(item: DomainItem): FrontendDomain {
  const screenshot =
    item.screenshot_path && item.screenshot_path.trim() !== ""
      ? item.screenshot_path.startsWith("data:image")
        ? item.screenshot_path
        : `data:image/png;base64,${item.screenshot_path}`
      : "/screenshots/placeholder.png";

  return {
    id: item.domain_id.toString(),
    domain_id: item.domain_id,
    domain: item.domain,
    url: item.url || "",
    status: mapStatus(item.status),
    confidenceScore: item.score,
    screenshot,
    reasoning: item.reasoning,
    verifiedBy: item.verifikator,
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
};
