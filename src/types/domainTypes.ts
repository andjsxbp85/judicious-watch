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
  id: string;
  domain: string;
  url: string[];
  status: DomainStatus;
  confidenceScore: number;
  reasoning: string;
  screenshot: string | null;
  verifiedBy: string | null;
  timestamp_latest: string | null;
  crawl_id: string | null;
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
  crawl_id: string | null;
}

// ============================================
// DOMAIN DETAIL API TYPES
// ============================================

// Single crawl history item from domain detail API
export interface CrawlHistoryItem {
  crawl_id: string;
  url: string;
  timestamp: string;
  status: DomainStatus;
  confidence_score: number;
  reasoning: string | null;
  inner_text: string;
  screenshot: string | null;
  is_amp: boolean;
}

// API Response for GET /api/data/domains/{domain_id}
export interface DomainDetailResponse {
  success: boolean;
  domain_id: string;
  domain_name: string;
  crawls: CrawlHistoryItem[];
}

// Frontend formatted crawl item for display
export interface FrontendCrawlItem {
  crawl_id: string;
  url: string;
  timestamp: string;
  status: "not-verified" | "judol" | "non-judol";
  confidenceScore: number;
  reasoning: string;
  innerText: string;
  screenshot: string;
  isAmp: boolean;
}

// Frontend formatted domain detail
export interface FrontendDomainDetail {
  domainId: string;
  domainName: string;
  crawls: FrontendCrawlItem[];
}
