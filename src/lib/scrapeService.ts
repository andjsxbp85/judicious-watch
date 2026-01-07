import ENDPOINTS from "@/constants/endpoint";
import { apiClient } from "@/lib/apiClient";

// ============================================
// TYPES
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

export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ValidationError {
  detail: ValidationErrorDetail[];
}

// ============================================
// SCRAPE SERVICE
// ============================================

export const scrapeService = {
  /**
   * Scrape multiple keywords using the specified crawl engine
   * @param request - The scrape request containing keywords, engine, and AI reasoning flag
   * @returns Promise with the scrape results
   */
  async scrapeMultiKeyword(
    request: ScrapeMultiKeywordRequest
  ): Promise<ScrapeMultiKeywordResponse> {
    return apiClient(ENDPOINTS.SCRAPE_MULTI_KEYWORD, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },
};
