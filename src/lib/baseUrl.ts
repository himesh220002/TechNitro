// export const baseUrl =
//   process.env.NEXT_PUBLIC_SITE_URL ||
//   "http://localhost:3000";


  export const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://tech-nitro.vercel.app/"
    : "http://localhost:3000");