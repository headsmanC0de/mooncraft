'use client'

import { CommandPanel } from './CommandPanel'
import { Minimap } from './Minimap'
import { ResourceBar } from './ResourceBar'
import { SelectionPanel } from './SelectionPanel'

export function HUD() {
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
		</div>
	)
}
