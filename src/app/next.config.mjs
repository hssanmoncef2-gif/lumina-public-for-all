/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      {
        source: '/gutenberg-proxy/:path*',
        destination: 'https://www.gutenberg.org/:path*',
      },
    ]
  },
}

export default nextConfig
