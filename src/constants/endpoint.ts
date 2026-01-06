const ENDPOINTS = {
  // ============================================
  // AUTHENTICATION
  // ============================================
  AUTH_LOGIN: "/api/auth/login",
  
  // ============================================
  // USERS
  // ============================================
  USERS_ME: "/api/users/me",
} as const;

export default ENDPOINTS;
