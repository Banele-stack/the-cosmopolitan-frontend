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
    // Next 16 added SSRF protection to the image optimizer: it resolves
    // every remote image's hostname and refuses to fetch it if that
    // resolves to a private/loopback IP — "localhost" always does. Without
    // this, every uploaded photo (rooms, businesses, gigs — anywhere
    // next/image renders one from the API) 400s from /_next/image in local
    // dev with `"url" parameter is not allowed`, even though the image
    // itself loads fine when hit directly. Production is unaffected: the
    // onrender.com backend resolves to a public IP, so this flag never
    // comes into play there — it only matters for the localhost:3000
    // pattern below.
    dangerouslyAllowLocalIP: true,
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
      {
        // Production backend — serves real listing photos uploaded via
        // the room/business create forms (see multer config in the API),
        // when STORAGE_DRIVER on the API is left as "local".
        protocol: "https",
        hostname: "the-cosmopolitan-api.onrender.com",
      },
      {
        // Production photo storage (STORAGE_DRIVER=s3 on the API) — every
        // uploaded business/room photo lives here now instead of on the
        // API's own disk. Without this pattern, next/image's optimizer
        // 400s ("INVALID_IMAGE_OPTIMIZE_REQUEST") on every single one,
        // since it only ever fetches from hosts explicitly allowed here.
        protocol: "https",
        hostname: "cosmopolitan-uploads-prod.s3.af-south-1.amazonaws.com",
      },
      {
        // Local dev backend.
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
    ],
  },
};

module.exports = nextConfig;