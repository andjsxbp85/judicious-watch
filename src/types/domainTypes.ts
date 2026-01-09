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

// Single domain item from API response (new structure with arrays)
export interface DomainItem {
  id: string;
  domain: string;
  url: string[];
  status: DomainStatus[];
  confidenceScore: number[];
  screenshot: (string | null)[];
  verifiedBy: (string | null)[];
}

// API Response for GET /api/data/domains
export interface GetDomainsResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  data: DomainItem[];
}

// Request body for PATCH /api/data/domains/{domain_id}/status
export interface UpdateDomainStatusRequest {
  status: DomainStatus;
}

// API Response for PATCH /api/data/domains/{domain_id}/status
export interface UpdateDomainStatusResponse {
  success: boolean;
  message: string;
  updated_count: number;
}

// Frontend Domain type (mapped from API response)
// For display in Verification table, we show first URL with its status/score
export interface FrontendDomain {
  id: string;
  domain: string;
  url: string; // First URL for display
  urls: string[]; // All URLs
  status: "not-verified" | "judol" | "non-judol"; // First status for display
  statuses: ("not-verified" | "judol" | "non-judol")[]; // All statuses
  confidenceScore: number; // First score for display
  confidenceScores: number[]; // All scores
  screenshot: string; // First screenshot for display
  screenshots: (string | null)[]; // All screenshots
  verifiedBy: string | null; // First verifier for display
  verifiedBys: (string | null)[]; // All verifiers
  urlCount: number; // Number of URLs under this domain
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
  keyword: string | null;
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
  keyword: string | null;
}

// Frontend formatted domain detail
export interface FrontendDomainDetail {
  domainId: string;
  domainName: string;
  crawls: FrontendCrawlItem[];
}

// ============================================
// LLM INFERENCE API TYPES
// ============================================

// LLM inference result structure
export interface LLMInferenceResult {
  label: string; // e.g., "judi" or "non-judi"
  reasoning: string;
  confidence: number; // 0-100
}

// Received data in the LLM response
export interface LLMReceivedData {
  success: boolean;
  message: string;
  domain: string;
  inference_id: string;
  result: LLMInferenceResult;
}

// API Response for POST /api/inference/to-llm
export interface SendToLLMResponse {
  success: boolean;
  message: string;
  received_data: LLMReceivedData;
}
