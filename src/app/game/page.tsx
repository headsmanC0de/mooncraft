import { GameCanvas } from '@/components/game/GameCanvas'
import { HUD } from '@/components/hud/HUD'

export default function GamePage() {
	return (
		<div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
			<GameCanvas />
			<HUD />
		</div>
	)
}
