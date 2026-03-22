/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
	turbopack: {},
}

export default nextConfig
