import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Produces a self-contained .next/standalone build (a minimal server.js
  // plus only the node_modules actually used) — what Dockerfile's runtime
  // stage copies, instead of shipping the entire node_modules tree into the
  // image.
  output: "standalone",
};

export default nextConfig;
