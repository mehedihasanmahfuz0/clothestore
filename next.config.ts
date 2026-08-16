const nextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-neon", "ws"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
