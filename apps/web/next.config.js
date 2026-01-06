/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@sammo/common", "@sammo/logic"],
};

module.exports = nextConfig;
