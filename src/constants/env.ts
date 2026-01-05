export const APP_BASE_URL_API = import.meta.env.VITE_API_URL as string;

if (!APP_BASE_URL_API) {
  throw new Error(
    "VITE_API_URL is not defined. Please add it to your .env.local file."
  );
}

export const APP_NAME = import.meta.env.VITE_APP_NAME;

export const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN;

export const APP_COOKIE_NAME = import.meta.env.VITE_APP_COOKIE_NAME;

export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_PRODUCTION = import.meta.env.PROD;
