import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // This is the correct place for some experimental features, but not allowedDevOrigins
  },
  // Add allowedDevOrigins at the top level for development server configuration
  devServer: {
    allowedDevOrigins: [
      'https://6000-firebase-studio-1762025061897.cluster-cz5nqyh5nreq6ua6gaqd7okl7o.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
