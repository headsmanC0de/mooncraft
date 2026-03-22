'use client'

import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import { componentManager, entityManager } from '@/lib/ecs'
import type {
	BuildingComponent,
	EntityId,
	HealthComponent,
	RenderComponent,
	ResourceComponent,
	SelectionComponent,
	TransformComponent,
} from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { BuildingMesh } from './BuildingMesh'
import { MineralMesh } from './MineralMesh'
import { UnitMesh } from './UnitMesh'

type EntityType = 'unit' | 'building' | 'resource'

interface EntitySnapshot {
	id: EntityId
	entityType: EntityType
	transform: TransformComponent
	health?: HealthComponent
	selection?: SelectionComponent
	render?: RenderComponent
	building?: BuildingComponent
	resource?: ResourceComponent
}

export function EntityRenderer() {
	const [entities, setEntities] = useState<EntitySnapshot[]>([])

	useFrame(() => {
		const all = entityManager.getAllEntities()
		const snapshots: EntitySnapshot[] = []

		for (const entity of all) {
			const transform = componentManager.getComponent<TransformComponent>(
				entity.id,
				ComponentType.TRANSFORM,
			)
			if (!transform) continue

			const health = componentManager.getComponent<HealthComponent>(entity.id, ComponentType.HEALTH)
			const selection = componentManager.getComponent<SelectionComponent>(
				entity.id,
				ComponentType.SELECTION,
			)
			const render = componentManager.getComponent<RenderComponent>(entity.id, ComponentType.RENDER)
			const building = componentManager.getComponent<BuildingComponent>(
				entity.id,
				ComponentType.BUILDING,
			)
			const resource = componentManager.getComponent<ResourceComponent>(
				entity.id,
				ComponentType.RESOURCE,
			)

			let entityType: EntityType
			if (resource) {
				entityType = 'resource'
			} else if (building) {
				entityType = 'building'
			} else {
				entityType = 'unit'
			}

			snapshots.push({
				id: entity.id,
				entityType,
				transform,
				health,
				selection,
				render,
				building,
				resource,
			})
		}

		setEntities(snapshots)
	})

	return (
		<>
			{entities
				.filter((e) => !e.render || e.render.visible)
				.map((e) => {
					switch (e.entityType) {
						case 'resource':
							return <MineralMesh key={e.id} transform={e.transform} resource={e.resource!} />
						case 'building':
							return (
								<BuildingMesh
									key={e.id}
									transform={e.transform}
									health={
										e.health ?? { type: ComponentType.HEALTH, current: 100, max: 100, armor: 0 }
									}
									building={e.building!}
									selection={e.selection ?? { type: ComponentType.SELECTION, isSelected: false }}
									render={e.render ?? { type: ComponentType.RENDER, visible: true }}
								/>
							)
						case 'unit':
							return (
								<UnitMesh
									key={e.id}
									transform={e.transform}
									health={
										e.health ?? { type: ComponentType.HEALTH, current: 100, max: 100, armor: 0 }
									}
									selection={e.selection ?? { type: ComponentType.SELECTION, isSelected: false }}
									render={e.render ?? { type: ComponentType.RENDER, visible: true }}
								/>
							)
						default:
							return null
					}
				})}
		</>
	)
}
