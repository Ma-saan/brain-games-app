import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WSL環境でのアクセスを可能にする設定
  experimental: {
    serverExternalPackages: []
  }
};

export default nextConfig;
