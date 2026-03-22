'use client'

import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { Component, type ReactNode, Suspense } from 'react'
import { HUD } from '@/components/hud/HUD'
import { useGameStore } from '@/stores/gameStore'

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

interface ErrorBoundaryState {
	hasError: boolean
	error: Error | null
}

class GameErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
	state: ErrorBoundaryState = { hasError: false, error: null }

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error }
	}

	render() {
		if (this.state.hasError) {
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
						color: '#fff',
						fontFamily: 'monospace',
						textAlign: 'center',
						padding: '2rem',
					}}
				>
					<h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#dd3333' }}>
						Failed to Load Game
					</h1>
					<p style={{ color: '#9ca3af', marginBottom: '1rem', maxWidth: '400px' }}>
						Your browser may not support WebGL, or the graphics driver crashed. Try refreshing or
						using a different browser.
					</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						style={{
							padding: '12px 24px',
							background: '#4a9fd9',
							color: '#000',
							border: 'none',
							borderRadius: '6px',
							cursor: 'pointer',
							fontSize: '1rem',
							fontWeight: 'bold',
						}}
					>
						Refresh Page
					</button>
				</div>
			)
		}
		return this.props.children
	}
}

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

function GamePageInner() {
	const searchParams = useSearchParams()
	const faction = (searchParams.get('faction') as 'terran' | 'protoss') || 'terran'
	const difficulty = (searchParams.get('difficulty') as 'easy' | 'normal' | 'hard') || 'normal'
	const mapId = searchParams.get('map') || 'random'

	// Set player faction, difficulty, and map in store before game initializes
	const currentFaction = useGameStore((s) => s.playerFaction)
	const currentDifficulty = useGameStore((s) => s.aiDifficulty)
	const currentMapId = useGameStore((s) => s.selectedMapId)
	if (currentFaction !== faction || currentDifficulty !== difficulty || currentMapId !== mapId) {
		useGameStore.setState({
			playerFaction: faction,
			aiDifficulty: difficulty,
			selectedMapId: mapId !== 'random' ? mapId : null,
		})
	}

	return (
		<div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
			<GameCanvas />
			<HUD />
		</div>
	)
}

export default function GamePage() {
	return (
		<GameErrorBoundary>
			<Suspense fallback={<LoadingScreen />}>
				<GamePageInner />
			</Suspense>
		</GameErrorBoundary>
	)
}
