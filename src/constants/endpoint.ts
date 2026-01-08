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
  GET_SCRAPED_DATA: `${APP_BASE_URL_API}/scrape/multi-keyword`,

  // ============================================
  // DOMAINS
  // ============================================
  GET_DOMAINS: `${APP_BASE_URL_API}/api/data/domains`,
  GET_DOMAIN_DETAIL: (domainId: string) =>
    `${APP_BASE_URL_API}/api/data/domains/${domainId}`,
} as const;

export default ENDPOINTS;
