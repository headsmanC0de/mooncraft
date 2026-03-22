import type { Metadata } from 'next'
import { GAME_CONFIG } from '@/config'
import './globals.css'

export const metadata: Metadata = {
	title: `${GAME_CONFIG.branding.name} - Online RTS`,
	description: GAME_CONFIG.branding.tagline,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	)
}
