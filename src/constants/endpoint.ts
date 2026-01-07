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
} as const;

export default ENDPOINTS;
