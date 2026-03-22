'use client'

import dynamic from 'next/dynamic'
import { HUD } from '@/components/hud/HUD'

const GameCanvas = dynamic(
	() =>
		import('@/components/game/GameCanvas').then((m) => ({
			default: m.GameCanvas,
		})),
	{
		ssr: false,
		loading: () => <LoadingScreen />,
	},
)

function LoadingScreen() {
	return (
		<div
			style={{
				width: '100vw',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				background: '#0a0a0f',
				color: '#ffffff',
				fontFamily: 'monospace',
			}}
		>
			<div
				style={{
					fontSize: '2rem',
					fontWeight: 'bold',
					marginBottom: '2rem',
					background: 'linear-gradient(90deg, #4a9fd9, #9b59b6, #00d4ff)',
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
				}}
			>
				Loading...
			</div>
			<div
				style={{
					width: '200px',
					height: '4px',
					background: '#1a1a2f',
					borderRadius: '2px',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						width: '40%',
						height: '100%',
						background: 'linear-gradient(90deg, #4a9fd9, #00d4ff)',
						borderRadius: '2px',
						animation: 'loading-slide 1.5s ease-in-out infinite',
					}}
				/>
			</div>
			<style>{`
				@keyframes loading-slide {
					0% { transform: translateX(-100%); }
					100% { transform: translateX(350%); }
				}
			`}</style>
		</div>
	)
}

export default function GamePage() {
	return (
		<div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
			<GameCanvas />
			<HUD />
		</div>
	)
}
