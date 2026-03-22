'use client'

import type { GameStatus } from '@/lib/game/GameManager'

interface GameOverScreenProps {
	status: Exclude<GameStatus, 'playing'>
}

export function GameOverScreen({ status }: GameOverScreenProps) {
	const isVictory = status === 'victory'

	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: 'rgba(0, 0, 0, 0.75)',
				zIndex: 100,
				pointerEvents: 'auto',
			}}
		>
			<h1
				style={{
					fontSize: '6rem',
					fontWeight: 'bold',
					color: isVictory ? '#22cc44' : '#dd3333',
					textShadow: `0 0 40px ${isVictory ? '#22cc44' : '#dd3333'}`,
					marginBottom: '2rem',
					fontFamily: 'sans-serif',
					letterSpacing: '0.2em',
				}}
			>
				{isVictory ? 'VICTORY' : 'DEFEAT'}
			</h1>
			<button
				type="button"
				onClick={() => window.location.reload()}
				style={{
					padding: '16px 48px',
					fontSize: '1.5rem',
					fontWeight: 'bold',
					backgroundColor: isVictory ? '#22cc44' : '#dd3333',
					color: '#000',
					border: 'none',
					borderRadius: '8px',
					cursor: 'pointer',
					fontFamily: 'sans-serif',
				}}
			>
				Play Again
			</button>
		</div>
	)
}
