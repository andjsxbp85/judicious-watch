import ENDPOINTS from "@/constants/endpoint";
import { apiClient } from "@/lib/apiClient";
import type {
  ScrapeMultiKeywordRequest,
  ScrapeMultiKeywordResponse,
  GetKeywordsResponse,
} from "@/types/scrapeTypes";

// Re-export types for consumers
export type { CrawlEngine } from "@/types/scrapeTypes";
export type {
  ScrapeMultiKeywordRequest,
  ScrapeMultiKeywordResponse,
  KeywordItem,
  GetKeywordsResponse,
  ValidationErrorDetail,
  ValidationError,
} from "@/types/scrapeTypes";

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

  /**
   * Get all keywords from database
   * @returns Promise with the list of keywords
   */
  async getKeywords(): Promise<GetKeywordsResponse> {
    return apiClient(ENDPOINTS.GET_KEYWORDS, {
      method: "GET",
    });
  },
};
