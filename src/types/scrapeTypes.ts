// ============================================
// SCRAPE API TYPES
// ============================================

export type CrawlEngine = "google" | "baidu" | "bing";

export interface ScrapeMultiKeywordRequest {
  keywords: string[];
  crawl_engine: CrawlEngine;
  ai_reasoning: boolean;
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
