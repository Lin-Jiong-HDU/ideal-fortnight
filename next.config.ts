import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PM2 部署时移除 output: 'export'
  // output: 'export',
  trailingSlash: true,
};

export default nextConfig;
