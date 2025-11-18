import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yvnqvzkgxudodfxofagu.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    
    domains: ['picsum.photos',
      'lh3.googleusercontent.com',
    ],
    
  
  },
};

export default nextConfig;
