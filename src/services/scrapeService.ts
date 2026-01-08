import ENDPOINTS from "@/constants/endpoint";
import { apiClient } from "@/lib/apiClient";
import type {
  ScrapeMultiKeywordRequest,
  ScrapeMultiKeywordResponse,
  GetKeywordsResponse,
  CreateKeywordRequest,
  CreateKeywordResponse,
  UpdateKeywordRequest,
  UpdateKeywordResponse,
  DeleteKeywordResponse,
} from "@/types/scrapeTypes";

// Re-export types for consumers
export type { CrawlEngine } from "@/types/scrapeTypes";
export type {
  ScrapeMultiKeywordRequest,
  ScrapeMultiKeywordResponse,
  KeywordItem,
  GetKeywordsResponse,
  CreateKeywordRequest,
  CreateKeywordResponse,
  UpdateKeywordRequest,
  UpdateKeywordResponse,
  DeleteKeywordResponse,
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

  /**
   * Create a new keyword
   * @param request - The keyword to create
   * @returns Promise with the created keyword
   */
  async createKeyword(
    request: CreateKeywordRequest
  ): Promise<CreateKeywordResponse> {
    return apiClient(ENDPOINTS.CREATE_KEYWORD, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Update an existing keyword
   * @param keywordId - The ID of the keyword to update
   * @param request - The updated keyword data
   * @returns Promise with the updated keyword
   */
  async updateKeyword(
    keywordId: string,
    request: UpdateKeywordRequest
  ): Promise<UpdateKeywordResponse> {
    return apiClient(ENDPOINTS.UPDATE_KEYWORD(keywordId), {
      method: "PUT",
      body: JSON.stringify(request),
    });
  },

  /**
   * Delete a keyword
   * @param keywordId - The ID of the keyword to delete
   * @returns Promise with the deletion confirmation
   */
  async deleteKeyword(keywordId: string): Promise<DeleteKeywordResponse> {
    return apiClient(ENDPOINTS.DELETE_KEYWORD(keywordId), {
      method: "DELETE",
    });
  },
};
