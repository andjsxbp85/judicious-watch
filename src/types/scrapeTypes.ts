// ============================================
// SCRAPE API TYPES
// ============================================

export type CrawlEngine = "google" | "baidu" | "bing";

export interface ScrapeMultiKeywordRequest {
  keywords: string[];
  crawl_engine: CrawlEngine;
  ai_reasoning: boolean;
}

export interface ScrapeMultiKeywordResponse {
  [key: string]: unknown;
}

export interface KeywordItem {
  id: string;
  keyword: string;
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
