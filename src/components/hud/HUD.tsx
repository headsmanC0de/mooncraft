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
		<div
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
			<ResourceBar />
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-end',
					padding: '0 8px 8px',
				}}
			>
				<SelectionPanel />
				<Minimap />
				<CommandPanel />
			</div>
			{gameStatus !== 'playing' && <GameOverScreen status={gameStatus} />}
		</div>
	)
}
