/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@sammo/common", "@sammo/logic"],
  output: "standalone",
};

module.exports = nextConfig;
