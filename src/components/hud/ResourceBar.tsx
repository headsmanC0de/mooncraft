'use client'

import { useGameStore } from '@/stores/gameStore'

export function ResourceBar() {
	const players = useGameStore((s) => s.players)
	const currentTick = useGameStore((s) => s.currentTick)

	const player = players.get('player1')
	const minerals = player?.resources.minerals ?? 0
	const gas = player?.resources.gas ?? 0
	const supply = player?.resources.supply ?? 0
	const maxSupply = player?.resources.maxSupply ?? 0

	const totalSeconds = Math.floor(currentTick / 60)
	const minutes = Math.floor(totalSeconds / 60)
	const seconds = totalSeconds % 60
	const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`

	return (
		<div
			style={{
				background: 'rgba(0, 0, 0, 0.85)',
				height: 36,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 24,
				fontFamily: 'monospace',
				fontSize: 14,
				color: 'white',
				pointerEvents: 'auto',
				userSelect: 'none',
			}}
		>
			<span title={`Minerals: ${Math.floor(minerals)}`}>
				{'\u{1F48E}'} {Math.floor(minerals)}
			</span>
			<span title={`Gas: ${Math.floor(gas)}`}>
				{'\u{26FD}'} {Math.floor(gas)}
			</span>
			<span title={`Supply: ${supply} of ${maxSupply}`}>
				{'\u{1F3E0}'} {supply}/{maxSupply}
			</span>
			<span title={`Game time: ${timeStr}`}>
				{'\u{23F1}'} {timeStr}
			</span>
		</div>
	)
}
