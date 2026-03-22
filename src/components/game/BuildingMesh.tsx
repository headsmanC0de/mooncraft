'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import type {
	BuildingComponent,
	HealthComponent,
	RenderComponent,
	SelectionComponent,
	TransformComponent,
} from '@/types/ecs'

interface BuildingMeshProps {
	transform: TransformComponent
	health: HealthComponent
	building: BuildingComponent
	selection: SelectionComponent
	render: RenderComponent
}

function getHealthColor(percent: number): string {
	if (percent > 0.6) return '#00ff00'
	if (percent > 0.3) return '#ffff00'
	return '#ff0000'
}

export function BuildingMesh({
	transform,
	health,
	building,
	selection,
	render,
}: BuildingMeshProps) {
	const healthBarRef = useRef<Group>(null)
	const healthPercent = health.max > 0 ? health.current / health.max : 0
	const progress = building.buildProgress
	const isBuilding = progress < 1

	const scaleX = transform.scale.x
	const scaleY = transform.scale.y * progress
	const scaleZ = transform.scale.z
	const ringSize = Math.max(scaleX, scaleZ) * 0.7

	useFrame(({ camera }) => {
		if (healthBarRef.current) {
			healthBarRef.current.quaternion.copy(camera.quaternion)
		}
	})

	return (
		<group position={[transform.position.x, transform.position.y, transform.position.z]}>
			{/* Building body */}
			<mesh castShadow position={[0, scaleY / 2, 0]}>
				<boxGeometry args={[scaleX, scaleY, scaleZ]} />
				<meshStandardMaterial
					color={render.color ?? '#888888'}
					transparent={isBuilding}
					opacity={isBuilding ? 0.5 + progress * 0.5 : 1}
				/>
			</mesh>

			{/* Roof pyramid (shown when complete) */}
			{!isBuilding && (
				<mesh castShadow position={[0, transform.scale.y + 0.25, 0]}>
					<coneGeometry args={[Math.min(scaleX, scaleZ) * 0.6, 0.5, 4]} />
					<meshStandardMaterial color={render.color ?? '#888888'} metalness={0.3} roughness={0.7} />
				</mesh>
			)}

			{/* Selection ring */}
			{selection.isSelected && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
					<ringGeometry args={[ringSize, ringSize + 0.15, 32]} />
					<meshBasicMaterial color="#00ff88" transparent opacity={0.8} />
				</mesh>
			)}

			{/* Build progress bar */}
			{isBuilding && (
				<group ref={healthBarRef} position={[0, transform.scale.y + 0.5, 0]}>
					<mesh position={[0, 0, -0.001]}>
						<planeGeometry args={[1.2, 0.1]} />
						<meshBasicMaterial color="#333333" transparent opacity={0.6} />
					</mesh>
					<mesh position={[(progress - 1) * 0.6, 0, 0]}>
						<planeGeometry args={[1.2 * progress, 0.1]} />
						<meshBasicMaterial color="#ffcc00" />
					</mesh>
				</group>
			)}

			{/* Health bar (shown when complete) */}
			{!isBuilding && (
				<group ref={healthBarRef} position={[0, transform.scale.y + 0.8, 0]}>
					<mesh position={[0, 0, -0.001]}>
						<planeGeometry args={[1.2, 0.1]} />
						<meshBasicMaterial color="#333333" transparent opacity={0.6} />
					</mesh>
					<mesh position={[(healthPercent - 1) * 0.6, 0, 0]}>
						<planeGeometry args={[1.2 * healthPercent, 0.1]} />
						<meshBasicMaterial color={getHealthColor(healthPercent)} />
					</mesh>
				</group>
			)}
		</group>
	)
}
