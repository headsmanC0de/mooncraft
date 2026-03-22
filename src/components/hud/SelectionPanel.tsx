'use client'

import { BUILDING_DEFINITIONS, UNIT_DEFINITIONS } from '@/config'
import { componentManager, entityManager } from '@/lib/ecs'
import { useGameStore } from '@/stores/gameStore'
import type { BuildingComponent, HealthComponent, OwnerComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'

function getEntityDisplayInfo(entityId: string) {
	const entity = entityManager.getEntity(entityId)
	if (!entity) return null

	const health = componentManager.getComponent<HealthComponent>(entityId, ComponentType.HEALTH)
	const building = componentManager.getComponent<BuildingComponent>(
		entityId,
		ComponentType.BUILDING,
	)
	const owner = componentManager.getComponent<OwnerComponent>(entityId, ComponentType.OWNER)

	let name = 'Unknown'
	let isBuilding = false

	if (building) {
		isBuilding = true
		const def = BUILDING_DEFINITIONS[building.buildingType]
		name = def?.name ?? building.buildingType
	} else if (owner) {
		// Try to determine unit type from render color or other means
		for (const [_id, def] of Object.entries(UNIT_DEFINITIONS)) {
			// Match by checking component existence patterns
			if (
				def.canGather &&
				componentManager.hasComponent(entityId, ComponentType.RESOURCE_CARRIER)
			) {
				name = def.name
				break
			}
			if (
				!def.canGather &&
				def.combat &&
				componentManager.hasComponent(entityId, ComponentType.COMBAT)
			) {
				const combat = componentManager.getComponent(entityId, ComponentType.COMBAT) as
					| { attackDamage: number }
					| undefined
				if (combat && combat.attackDamage === def.combat.damage) {
					name = def.name
					break
				}
			}
		}
	}

	return {
		name,
		isBuilding,
		health: health ? { current: health.current, max: health.max, armor: health.armor } : null,
		buildProgress: building ? building.buildProgress : null,
		queue: building ? building.queue : [],
	}
}

export function SelectionPanel() {
	const selectedUnits = useGameStore((s) => s.selectedUnits)

	if (selectedUnits.length === 0) return null

	const infos = selectedUnits.map(getEntityDisplayInfo).filter(Boolean) as NonNullable<
		ReturnType<typeof getEntityDisplayInfo>
	>[]

	if (infos.length === 0) return null

	const showSingle = infos.length === 1
	const info = infos[0]

	return (
		<div
			style={{
				width: 250,
				height: 120,
				background: 'rgba(0, 0, 0, 0.85)',
				border: '1px solid rgba(255, 255, 255, 0.1)',
				borderRadius: 4,
				padding: 8,
				fontFamily: 'monospace',
				fontSize: 12,
				color: 'white',
				pointerEvents: 'auto',
				userSelect: 'none',
				overflow: 'hidden',
			}}
		>
			{showSingle ? (
				<div>
					<div style={{ fontWeight: 'bold', marginBottom: 6 }}>{info.name}</div>
					{info.health && (
						<div style={{ marginBottom: 4 }}>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									marginBottom: 2,
								}}
							>
								<span>
									HP: {Math.ceil(info.health.current)}/{info.health.max}
								</span>
								<span>Armor: {info.health.armor}</span>
							</div>
							<div
								style={{
									width: '100%',
									height: 6,
									background: 'rgba(255,255,255,0.15)',
									borderRadius: 3,
								}}
							>
								<div
									style={{
										width: `${(info.health.current / info.health.max) * 100}%`,
										height: '100%',
										background:
											info.health.current / info.health.max > 0.5
												? '#4caf50'
												: info.health.current / info.health.max > 0.25
													? '#ff9800'
													: '#f44336',
										borderRadius: 3,
										transition: 'width 0.2s',
									}}
								/>
							</div>
						</div>
					)}
					{info.isBuilding && info.buildProgress !== null && info.buildProgress < 1 && (
						<div style={{ marginTop: 4 }}>
							<span>Building: {Math.floor(info.buildProgress * 100)}%</span>
							<div
								style={{
									width: '100%',
									height: 4,
									background: 'rgba(255,255,255,0.15)',
									borderRadius: 2,
									marginTop: 2,
								}}
							>
								<div
									style={{
										width: `${info.buildProgress * 100}%`,
										height: '100%',
										background: '#2196f3',
										borderRadius: 2,
									}}
								/>
							</div>
						</div>
					)}
					{info.queue.length > 0 && (
						<div style={{ marginTop: 4 }}>
							<span>Queue: {info.queue.map((q) => q.type).join(', ')}</span>
						</div>
					)}
				</div>
			) : (
				<div>
					<div style={{ fontWeight: 'bold', marginBottom: 6 }}>{infos.length} units selected</div>
					<div
						style={{
							display: 'flex',
							flexWrap: 'wrap',
							gap: 4,
						}}
					>
						{infos.slice(0, 16).map((inf, i) => (
							<div
								key={selectedUnits[i]}
								style={{
									width: 28,
									height: 28,
									background: 'rgba(255,255,255,0.1)',
									border: '1px solid rgba(255,255,255,0.2)',
									borderRadius: 2,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: 9,
								}}
							>
								{inf.name.charAt(0)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
