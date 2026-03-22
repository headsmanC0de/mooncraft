'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { CommandPanel } from './CommandPanel'
import { GameOverScreen } from './GameOverScreen'
import { Minimap } from './Minimap'
import { ResourceBar } from './ResourceBar'
import { SelectionPanel } from './SelectionPanel'

export function HUD() {
	const gameStatus = useGameStore((s) => s.gameStatus)

	useEffect(() => {
		// Expose gameStore on window in dev mode for E2E testing
		if (process.env.NODE_ENV === 'development') {
			;(window as any).__gameStore = useGameStore
		}
	}, [])

	return (
		<section
			aria-label="Game HUD"
			style={{
				position: 'fixed',
				inset: 0,
				pointerEvents: 'none',
				zIndex: 10,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
			}}
		>
			<div role="status" aria-live="polite">
				<ResourceBar />
			</div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-end',
					padding: '0 8px 8px',
				}}
			>
				<SelectionPanel />
				<aside aria-label="Minimap">
					<Minimap />
				</aside>
				<CommandPanel />
			</div>
			{gameStatus !== 'playing' && <GameOverScreen status={gameStatus} />}
		</section>
	)
}
