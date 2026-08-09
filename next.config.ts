import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Without this, Turbopack walks up from this project and finds an
  // unrelated package-lock.json in the user's home directory, infers THAT
  // as the workspace root, and warns on every build. Pinning it here is
  // the fix Next.js itself suggests for "multiple lockfiles detected".
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        protocol: "https",
        hostname: "loremflickr.com",
      },
    ],
  },
};

module.exports = nextConfig;