import { APP_BASE_URL_API } from "./env";

const ENDPOINTS = {
  // ============================================
  // AUTHENTICATION
  // ============================================
  AUTH_LOGIN: `${APP_BASE_URL_API}/api/auth/login`,

  // ============================================
  // USERS
  // ============================================
  USERS_ME: `${APP_BASE_URL_API}/api/users/me`,

  // ============================================
  // SCRAPING & CRAWLING
  // ============================================
  SCRAPE_MULTI_KEYWORD: `${APP_BASE_URL_API}/scrape/multi-keyword`,
  GET_KEYWORDS: `${APP_BASE_URL_API}/scrape/keywords`,
  CREATE_KEYWORD: `${APP_BASE_URL_API}/scrape/keywords`,
  UPDATE_KEYWORD: (keywordId: string) =>
    `${APP_BASE_URL_API}/scrape/keywords/${keywordId}`,
  DELETE_KEYWORD: (keywordId: string) =>
    `${APP_BASE_URL_API}/scrape/keywords/${keywordId}`,
  GET_SCRAPED_DATA: `${APP_BASE_URL_API}/scrape/multi-keyword`,

  // Keywords Schedule Management
  GET_KEYWORDS_SCHEDULE: `${APP_BASE_URL_API}/scrape/multiple-keyword-schedule`,
  SAVE_KEYWORDS_SCHEDULE: `${APP_BASE_URL_API}/scrape/multiple-keyword-schedule
`,

  // ============================================
  // DOMAINS
  // ============================================
  GET_DOMAINS: `${APP_BASE_URL_API}/api/data/domains`,
  GET_DOMAIN_DETAIL: (domainId: string) =>
    `${APP_BASE_URL_API}/api/data/domains/${domainId}`,
  UPDATE_DOMAIN_STATUS: (domainId: string) =>
    `${APP_BASE_URL_API}/api/data/domains/${domainId}/status`,
  EXPORT_JUDOL: `${APP_BASE_URL_API}/api/data/export/judol`,

  // ============================================
  // INFERENCE
  // ============================================
  SEND_TO_LLM: `${APP_BASE_URL_API}/api/inference/inference-all`,
} as const;

export default ENDPOINTS;
