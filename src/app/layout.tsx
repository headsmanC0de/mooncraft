import type { Metadata, Viewport } from 'next'
import { GAME_CONFIG } from '@/config'
import './globals.css'

export const viewport: Viewport = {
	themeColor: '#0a0a0f',
	colorScheme: 'dark',
}

export const metadata: Metadata = {
	title: `${GAME_CONFIG.branding.name} - Online RTS`,
	description: `${GAME_CONFIG.branding.name} is a free-to-play competitive real-time strategy game with 3D graphics. Command armies, manage economies, and outmaneuver opponents in fast-paced tactical battles.`,
	metadataBase: new URL('https://mooncraft.game'),
	openGraph: {
		title: `${GAME_CONFIG.branding.name} - Online RTS`,
		description:
			'Free-to-play competitive real-time strategy game with 3D graphics and multiplayer.',
		type: 'website',
		locale: 'en_US',
	},
	twitter: {
		card: 'summary_large_image',
		title: `${GAME_CONFIG.branding.name} - Online RTS`,
		description: 'Free-to-play competitive real-time strategy game with 3D graphics.',
	},
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	)
}
