/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["sql.js", "jose", "@libsql/client"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
