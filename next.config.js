/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
};

module.exports = {
  // nextjs에서 aws S3 이미지를 사용하기 위해 추가
  images: {
    domains: [
      "api-production.s3.amazonaws.com",
      "carrot-market.s3.ap-northeast-2.amazonaws.com",
      "customer-qkzviq88w8n4p4hm.cloudflarestream.com",
    ],
    // formats: ['image/avif', 'image/webp'], // 이미지를 avif형식으로 사용하고 싶을 때 추가
  },
};

module.exports = nextConfig;
