import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "10.*.*.*", "192.168.*.*", "172.*.*.*"],
};

export default nextConfig;
