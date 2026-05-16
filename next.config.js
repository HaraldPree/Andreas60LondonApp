/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  env: {
    // Baked into the client bundle at build time so we can compare against
    // the running server version (via /api/version) and detect when a new
    // deploy is live.
    NEXT_PUBLIC_BUILD_VERSION:
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.GITHUB_SHA ||
      `local-${Date.now()}`,
  },
};

module.exports = nextConfig;
