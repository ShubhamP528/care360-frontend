export const NODE_API_ENDPOINT =
  import.meta.env.NODE_ENV === "production"
    ? "https://shoping-app-backend.vercel.app/api"
    : "http://localhost:8900/api";
