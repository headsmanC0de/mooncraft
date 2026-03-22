'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Group } from 'three'
import type {
	HealthComponent,
	RenderComponent,
	SelectionComponent,
	TransformComponent,
} from '@/types/ecs'
import { generateUnitSprite } from '@/lib/sprites/SpriteGenerator'

interface UnitMeshProps {
	transform: TransformComponent
	health: HealthComponent
	selection: SelectionComponent
	render: RenderComponent
}

function getHealthColor(percent: number): string {
	if (percent > 0.6) return '#00ff00'
	if (percent > 0.3) return '#ffff00'
	return '#ff0000'
}

function getUnitType(scale: number): string {
	if (scale <= 0.85) return 'worker'
	if (scale <= 1.04) return 'marine'
	if (scale <= 1.14) return 'stalker'
	if (scale <= 1.34) return 'siege_tank'
	if (scale <= 1.44) return 'medivac'
	return 'colossus'
}

export function UnitMesh({ transform, health, selection, render }: UnitMeshProps) {
	const healthBarRef = useRef<Group>(null)
	const healthPercent = health.max > 0 ? health.current / health.max : 0
	const modelScale = transform.scale.x

	const unitType = getUnitType(modelScale)
	const teamColor = render.color ?? '#5577cc'

	const texture = useMemo(() => {
		if (typeof document === 'undefined') return null
		const canvas = generateUnitSprite(unitType, teamColor)
		const tex = new THREE.CanvasTexture(canvas)
		tex.needsUpdate = true
		return tex
	}, [unitType, teamColor])

	const spriteScale = modelScale * 2

	useFrame(({ camera }) => {
		if (healthBarRef.current) {
			healthBarRef.current.quaternion.copy(camera.quaternion)
		}
	})

	return (
		<group position={[transform.position.x, transform.position.y + 1, transform.position.z]}>
			{/* Unit sprite */}
			{texture && (
				<sprite scale={[spriteScale, spriteScale, 1]}>
					<spriteMaterial map={texture} transparent depthWrite={false} />
				</sprite>
			)}

			{/* Selection ring */}
			{selection.isSelected && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
					<ringGeometry args={[0.8 * modelScale, 0.95 * modelScale, 32]} />
					<meshBasicMaterial color="#00ff88" transparent opacity={0.8} />
				</mesh>
			)}

			{/* Health bar (billboard) */}
			<group ref={healthBarRef} position={[0, spriteScale / 2 + 0.3, 0]}>
				{/* Background */}
				<mesh position={[0, 0, -0.001]}>
					<planeGeometry args={[1.6, 0.15]} />
					<meshBasicMaterial color="#333333" transparent opacity={0.6} />
				</mesh>
				{/* Fill */}
				<mesh position={[(healthPercent - 1) * 0.8, 0, 0]}>
					<planeGeometry args={[1.6 * healthPercent, 0.15]} />
					<meshBasicMaterial color={getHealthColor(healthPercent)} />
				</mesh>

				{/* Shield bar - only for units with shields */}
				{health.maxShields != null && health.maxShields > 0 && (
					<group position={[0, 0.2, 0]}>
						{/* Background */}
						<mesh>
							<planeGeometry args={[1.6, 0.12]} />
							<meshBasicMaterial color="#222244" />
						</mesh>
						{/* Shield fill */}
						<mesh position={[((health.shields ?? 0) / health.maxShields - 1) * 0.8, 0, 0.01]}>
							<planeGeometry args={[1.6 * (health.shields ?? 0) / health.maxShields, 0.1]} />
							<meshBasicMaterial color="#4488ff" />
						</mesh>
					</group>
				)}
			</group>
		</group>
	)
}
