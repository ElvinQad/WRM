/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['randomuser.me'],
  },
  transpilePackages: ['@wrm/types'],
};

export default nextConfig;
