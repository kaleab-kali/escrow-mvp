/** @type {import('next').NextConfig} */
const isGhPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  ...(isGhPages
    ? {
        output: "export",
        images: { unoptimized: true },
        basePath: "/escrow-mvp",
        assetPrefix: "/escrow-mvp",
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
