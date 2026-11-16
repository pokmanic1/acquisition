// The Express API runs on :3000 (see ../.env). Proxying /api and /health
// through Next keeps requests same-origin, so the httpOnly `token` cookie
// set by /api/auth/sign-in is sent back automatically.
const API_URL = process.env.API_URL || 'http://localhost:3000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_URL}/api/:path*` },
      { source: '/health', destination: `${API_URL}/health` },
    ];
  },
};

export default nextConfig;
