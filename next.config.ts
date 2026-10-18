import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Saída autocontida para a imagem Docker (node server.js)
  output: "standalone",
};

export default nextConfig;
