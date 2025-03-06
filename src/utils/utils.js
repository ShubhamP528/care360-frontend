export const NODE_API_ENDPOINT =
  import.meta.env.NODE_ENV === "production"
    ? "https://care360-backend.vercel.app/api"
    : "http://localhost:8900/api";
