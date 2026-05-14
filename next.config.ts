import type { NextConfig } from "next";

const githubBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: githubBasePath,
  assetPrefix: githubBasePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: githubBasePath,
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
