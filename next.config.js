/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = {
  // nextjs에서 aws S3 이미지를 사용하기 위해 추가
  images: {
    domains: [
      "carrot-market.s3.ap-northeast-2.amazonaws.com",
      "customer-qkzviq88w8n4p4hm.cloudflarestream.com",
    ],
  },
};

module.exports = nextConfig;
