'use client'

import { useCallback, useState } from 'react'
import { BUILDING_DEFINITIONS, UNIT_DEFINITIONS } from '@/config'
import { componentManager, entityManager } from '@/lib/ecs'
import { useGameStore } from '@/stores/gameStore'
import type { BuildingComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'

const buttonStyle: React.CSSProperties = {
	width: 40,
	height: 40,
	background: 'rgba(80, 80, 80, 0.7)',
	border: '1px solid rgba(255,255,255,0.15)',
	borderRadius: 3,
	color: 'white',
	fontFamily: 'monospace',
	fontSize: 9,
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	textAlign: 'center' as const,
	padding: 2,
}

const buttonHoverStyle: React.CSSProperties = {
	...buttonStyle,
	background: 'rgba(120, 120, 120, 0.8)',
}

function CommandButton({ label, onClick }: { label: string; onClick?: () => void }) {
	const [hovered, setHovered] = useState(false)

	return (
		<button
			type="button"
			style={hovered ? buttonHoverStyle : buttonStyle}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={onClick}
		>
			{label}
		</button>
	)
}

export function CommandPanel() {
	const selectedUnits = useGameStore((s) => s.selectedUnits)
	const setPlacementMode = useGameStore((s) => s.setPlacementMode)
	const trainUnit = useGameStore((s) => s.trainUnit)
	const [showBuildMenu, setShowBuildMenu] = useState(false)

	const handleBuildClick = useCallback(
		(buildingType: string) => {
			setPlacementMode(buildingType)
			setShowBuildMenu(false)
		},
		[setPlacementMode],
	)

	const handleTrainClick = useCallback(
		(buildingId: string, unitType: string) => {
			trainUnit(buildingId, unitType)
		},
		[trainUnit],
	)

	if (selectedUnits.length === 0) return null

	// Determine what kind of entity is selected
	const firstId = selectedUnits[0]
	const entity = entityManager.getEntity(firstId)
	if (!entity) return null

	const building = componentManager.getComponent<BuildingComponent>(firstId, ComponentType.BUILDING)
	const isWorker = componentManager.hasComponent(firstId, ComponentType.RESOURCE_CARRIER)

	// Building selected: show train buttons
	if (building) {
		const def = BUILDING_DEFINITIONS[building.buildingType]
		const produces = def?.produces ?? []

		return (
			<div
				style={{
					width: 200,
					height: 120,
					background: 'rgba(0, 0, 0, 0.85)',
					border: '1px solid rgba(255,255,255,0.1)',
					borderRadius: 4,
					padding: 8,
					pointerEvents: 'auto',
					userSelect: 'none',
				}}
			>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 40px)',
						gap: 4,
					}}
				>
					{produces.map((unitType) => {
						const unitDef = UNIT_DEFINITIONS[unitType]
						return (
							<CommandButton
								key={unitType}
								label={`Train\n${unitDef?.name ?? unitType}`}
								onClick={() => handleTrainClick(firstId, unitType)}
							/>
						)
					})}
				</div>
			</div>
		)
	}

	// Worker selected: show unit commands + build option
	if (isWorker) {
		if (showBuildMenu) {
			return (
				<div
					style={{
						width: 200,
						height: 120,
						background: 'rgba(0, 0, 0, 0.85)',
						border: '1px solid rgba(255,255,255,0.1)',
						borderRadius: 4,
						padding: 8,
						pointerEvents: 'auto',
						userSelect: 'none',
					}}
				>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(3, 40px)',
							gap: 4,
						}}
					>
						<CommandButton label="Supply Depot" onClick={() => handleBuildClick('supply_depot')} />
						<CommandButton label="Barracks" onClick={() => handleBuildClick('barracks')} />
						<CommandButton label="Factory" onClick={() => handleBuildClick('factory')} />
						<CommandButton label="Back" onClick={() => setShowBuildMenu(false)} />
					</div>
				</div>
			)
		}

		return (
			<div
				style={{
					width: 200,
					height: 120,
					background: 'rgba(0, 0, 0, 0.85)',
					border: '1px solid rgba(255,255,255,0.1)',
					borderRadius: 4,
					padding: 8,
					pointerEvents: 'auto',
					userSelect: 'none',
				}}
			>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 40px)',
						gap: 4,
					}}
				>
					<CommandButton label="Move" />
					<CommandButton label="Stop" />
					<CommandButton label="Attack" />
					<CommandButton label="Hold" />
					<CommandButton label="Build (B)" onClick={() => setShowBuildMenu(true)} />
				</div>
			</div>
		)
	}

	// Regular unit selected: show basic commands
	return (
		<div
			style={{
				width: 200,
				height: 120,
				background: 'rgba(0, 0, 0, 0.85)',
				border: '1px solid rgba(255,255,255,0.1)',
				borderRadius: 4,
				padding: 8,
				pointerEvents: 'auto',
				userSelect: 'none',
			}}
		>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(3, 40px)',
					gap: 4,
				}}
			>
				<CommandButton label="Move" />
				<CommandButton label="Stop" />
				<CommandButton label="Attack" />
				<CommandButton label="Hold" />
			</div>
		</div>
	)
}
