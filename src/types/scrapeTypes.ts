// ============================================
// SCRAPE API TYPES
// ============================================

export type CrawlEngine = "google" | "baidu" | "bing";

export interface ScrapeMultiKeywordRequest {
  keywords: string[];
  crawl_engine: CrawlEngine;
  ai_reasoning: boolean;
  tld_whitelist: string;
}

export interface KeywordResult {
  keyword: string;
  success: boolean;
  total_fetched?: number;
  total_saved?: number;
  inference_triggered?: number | string;
  message?: string;
}

export interface ScrapeMultiKeywordResponse {
  success: boolean;
  message: string;
  total_keywords: number;
  engine: string;
  ai_reasoning: boolean;
  ocr_reasoning: boolean;
  results: KeywordResult[];
}

export interface KeywordItem {
  id: string;
  keyword: string;
  schedule?: string;
}

export interface CreateKeywordRequest {
  keyword: string;
}

export interface CreateKeywordResponse {
  id: string;
  keyword: string;
}

export interface UpdateKeywordRequest {
  keyword: string;
  schedule?: string;
}

export interface UpdateKeywordResponse {
  id: string;
  keyword: string;
}

export interface DeleteKeywordResponse {
  success: boolean;
  message: string;
}

export interface GetKeywordsResponse {
  success: boolean;
  total: number;
  data: KeywordItem[];
}

export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ValidationError {
  detail: ValidationErrorDetail[];
}

// ============================================
// MULTIPLE KEYWORDS SCHEDULE API TYPES
// ============================================

// Request body for POST /scrape/multiple-keyword-schedule
export interface SaveKeywordsScheduleRequest {
  keywords: string[]; // Array of keyword strings
  schedule: string; // cron expression
  crawl_engine: CrawlEngine; // Search engine to use
}

// Response for POST /scrape/multiple-keywords-schedule
export interface SaveKeywordsScheduleResponse {
  success: boolean;
  message: string;
  new_keywords: number; // Changed from keywords_updated
  schedule_updated: boolean;
  schedule: string;
}

// Response for GET /scrape/multiple-keyword-schedule
export interface GetKeywordsScheduleResponse {
  success: boolean;
  schedule: string; // cron expression e.g., "* */30 * * * *"
  crawl_engine?: CrawlEngine; // Search engine saved
  total: number;
  page: number; // Current page
  limit: number; // Items per page
  total_pages: number; // Total number of pages
  data: KeywordItem[]; // Array of keyword objects with id and keyword
}
