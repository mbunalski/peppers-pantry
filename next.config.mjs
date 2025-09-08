/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable unescaped entities rule for deployment
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
};

export default nextConfig;