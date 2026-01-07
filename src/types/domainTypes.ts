// ============================================
// DOMAIN API TYPES
// ============================================

export type DomainStatus = "not_verified" | "judol" | "non_judol";
export type ReasoningFilter = "all" | "has_reasoning" | "no_reasoning";
export type SortBy = "domain" | "score" | "timestamp";
export type SortOrder = "asc" | "desc";

// Query parameters for GET /api/data/domains
export interface GetDomainsParams {
  search?: string;
  status?: DomainStatus | "all";
  min_score?: number;
  max_score?: number;
  reasoning?: ReasoningFilter;
  verifikator?: string;
  page?: number;
  limit?: number;
  sort_by?: SortBy;
  order?: SortOrder;
}

// Single domain item from API response
export interface DomainItem {
  domain_id: number;
  domain: string;
  url: string | null;
  status: DomainStatus;
  score: number;
  reasoning: "Ada" | "Tidak Ada";
  screenshot_path: string | null;
  verifikator: string | null;
  timestamp_latest: string | null;
  crawl_id: number | null;
}

// API Response for GET /api/data/domains
export interface GetDomainsResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  data: DomainItem[];
}

// Frontend Domain type (mapped from API response)
export interface FrontendDomain {
  id: string;
  domain_id: number;
  domain: string;
  url: string;
  status: "not-verified" | "judol" | "non-judol";
  confidenceScore: number;
  screenshot: string;
  reasoning: string;
  verifiedBy: string | null;
  timestamp_latest: string | null;
  crawl_id: number | null;
}
