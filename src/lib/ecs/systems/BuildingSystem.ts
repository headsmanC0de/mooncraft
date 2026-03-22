import { getBuildingDef } from '@/config/buildings'
import type { BuildingComponent, Entity, HealthComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { System } from '../SystemManager'

export class BuildingSystem extends System {
	readonly requiredComponents = [ComponentType.BUILDING, ComponentType.HEALTH]
	readonly priority = 5

	update(entities: Entity[], deltaTime: number): void {
		for (const entity of entities) {
			const building = entity.components.get(ComponentType.BUILDING) as
				| BuildingComponent
				| undefined
			const health = entity.components.get(ComponentType.HEALTH) as HealthComponent | undefined
			if (!building || !health) continue
			if (building.buildProgress >= 1) continue

			const def = getBuildingDef(building.buildingType)
			const progressPerSecond = 1 / def.buildTime
			const newProgress = Math.min(1, building.buildProgress + progressPerSecond * deltaTime)
			building.buildProgress = newProgress
			health.current = Math.floor(newProgress * health.max)
		}
	}
}
