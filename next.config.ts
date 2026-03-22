import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true, // 确保动态路由正常工作
};

export default nextConfig;
