/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production
  reactStrictMode: true,
  
  // Transpile Three.js packages
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  
  // Webpack config for Three.js
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]
    return config
  },
}

export default nextConfig
