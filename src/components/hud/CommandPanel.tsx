'use client'

import { useCallback, useState } from 'react'
import { BUILDING_DEFINITIONS, UNIT_DEFINITIONS } from '@/config'
import { getBuildingDef } from '@/config/buildings'
import { componentManager, entityManager } from '@/lib/ecs'
import { canBuild } from '@/lib/game/techTree'
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

const disabledButtonStyle: React.CSSProperties = {
	...buttonStyle,
	opacity: 0.3,
	cursor: 'not-allowed',
}

function CommandButton({
	label,
	ariaLabel,
	onClick,
	disabled,
	tooltip,
}: {
	label: string
	ariaLabel?: string
	onClick?: () => void
	disabled?: boolean
	tooltip?: string
}) {
	const [hovered, setHovered] = useState(false)

	const style = disabled
		? disabledButtonStyle
		: hovered
			? buttonHoverStyle
			: buttonStyle

	return (
		<button
			type="button"
			aria-label={ariaLabel}
			title={tooltip}
			style={style}
			disabled={disabled}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={disabled ? undefined : onClick}
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
					role="toolbar"
					aria-label="Train units"
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 40px)',
						gap: 4,
					}}
				>
					{produces.map((unitType) => {
						const unitDef = UNIT_DEFINITIONS[unitType]
						const cost = unitDef?.cost
						const costStr = cost
							? `${cost.minerals} minerals${cost.gas ? `, ${cost.gas} gas` : ''}`
							: ''
						return (
							<CommandButton
								key={unitType}
								label={`Train\n${unitDef?.name ?? unitType}`}
								ariaLabel={`Train ${unitDef?.name ?? unitType} - ${costStr}`}
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
						role="toolbar"
						aria-label="Build structures"
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(3, 40px)',
							gap: 4,
						}}
					>
						{(['supply_depot', 'barracks', 'factory'] as const).map(
						(type) => {
							const def = getBuildingDef(type)
							const available = canBuild(type, 'player1')
							const requirementNames = def.requirements.map(
								(r) => getBuildingDef(r).name,
							)
							const costStr = `${def.cost.minerals} minerals${def.cost.gas ? `, ${def.cost.gas} gas` : ''}`
							return (
								<CommandButton
									key={type}
									label={def.name}
									ariaLabel={`Build ${def.name} - ${costStr}`}
									onClick={() => handleBuildClick(type)}
									disabled={!available}
									tooltip={
										available
											? undefined
											: `Requires: ${requirementNames.join(', ')}`
									}
								/>
							)
						},
					)}
						<CommandButton
							label="Back"
							ariaLabel="Back to commands"
							onClick={() => setShowBuildMenu(false)}
						/>
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
					role="toolbar"
					aria-label="Game commands"
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 40px)',
						gap: 4,
					}}
				>
					<CommandButton label="Move" ariaLabel="Move units" />
					<CommandButton label="Stop" ariaLabel="Stop units" />
					<CommandButton label="Attack" ariaLabel="Attack" />
					<CommandButton label="Hold" ariaLabel="Hold position" />
					<CommandButton
						label="Build (B)"
						ariaLabel="Open build menu"
						onClick={() => setShowBuildMenu(true)}
					/>
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
				role="toolbar"
				aria-label="Game commands"
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(3, 40px)',
					gap: 4,
				}}
			>
				<CommandButton label="Move" ariaLabel="Move units" />
				<CommandButton label="Stop" ariaLabel="Stop units" />
				<CommandButton label="Attack" ariaLabel="Attack" />
				<CommandButton label="Hold" ariaLabel="Hold position" />
			</div>
		</div>
	)
}
