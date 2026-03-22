'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Group } from 'three'
import type {
	BuildingComponent,
	HealthComponent,
	RenderComponent,
	SelectionComponent,
	TransformComponent,
} from '@/types/ecs'
import { generateBuildingSprite } from '@/lib/sprites/SpriteGenerator'

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
	const scaleZ = transform.scale.z
	const ringSize = Math.max(scaleX, scaleZ) * 0.7

	const teamColor = render.color ?? '#888888'
	const buildingType = building.buildingType ?? 'building'

	const texture = useMemo(() => {
		if (typeof document === 'undefined') return null
		const canvas = generateBuildingSprite(buildingType, teamColor)
		const tex = new THREE.CanvasTexture(canvas)
		tex.needsUpdate = true
		return tex
	}, [buildingType, teamColor])

	const spriteScale = Math.max(scaleX, scaleZ) * 1.5

	useFrame(({ camera }) => {
		if (healthBarRef.current) {
			healthBarRef.current.quaternion.copy(camera.quaternion)
		}
	})

	return (
		<group position={[transform.position.x, transform.position.y, transform.position.z]}>
			{/* Building sprite */}
			{texture && (
				<sprite position={[0, spriteScale / 2, 0]} scale={[spriteScale, spriteScale * progress, 1]}>
					<spriteMaterial
						map={texture}
						transparent
						depthWrite={false}
						opacity={isBuilding ? 0.5 + progress * 0.5 : 1}
					/>
				</sprite>
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
				<group ref={healthBarRef} position={[0, spriteScale + 0.5, 0]}>
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
				<group ref={healthBarRef} position={[0, spriteScale + 0.5, 0]}>
					<mesh position={[0, 0, -0.001]}>
						<planeGeometry args={[1.2, 0.1]} />
						<meshBasicMaterial color="#333333" transparent opacity={0.6} />
					</mesh>
					<mesh position={[(healthPercent - 1) * 0.6, 0, 0]}>
						<planeGeometry args={[1.2 * healthPercent, 0.1]} />
						<meshBasicMaterial color={getHealthColor(healthPercent)} />
					</mesh>

					{/* Shield bar - only for buildings with shields */}
					{health.maxShields != null && health.maxShields > 0 && (
						<group position={[0, 0.15, 0]}>
							{/* Background */}
							<mesh>
								<planeGeometry args={[1.2, 0.08]} />
								<meshBasicMaterial color="#222244" />
							</mesh>
							{/* Shield fill */}
							<mesh position={[((health.shields ?? 0) / health.maxShields - 1) * 0.6, 0, 0.01]}>
								<planeGeometry args={[(1.2 * (health.shields ?? 0)) / health.maxShields, 0.06]} />
								<meshBasicMaterial color="#4488ff" />
							</mesh>
						</group>
					)}
				</group>
			)}
		</group>
	)
}
