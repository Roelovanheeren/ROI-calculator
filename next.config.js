/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  env: {
    GHL_API_KEY: process.env.GHL_API_KEY || '',
    EMAIL_SERVICE_API_KEY: process.env.EMAIL_SERVICE_API_KEY || '',
  },
}

module.exports = nextConfig
