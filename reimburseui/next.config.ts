import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
