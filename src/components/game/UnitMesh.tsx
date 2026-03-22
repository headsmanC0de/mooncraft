'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import type {
	HealthComponent,
	RenderComponent,
	SelectionComponent,
	TransformComponent,
} from '@/types/ecs'

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

function getUnitGeometry(scale: number) {
	if (scale <= 0.85) {
		// Worker — small sphere
		return <sphereGeometry args={[0.3, 8, 6]} />
	} else if (scale >= 1.45) {
		// Colossus — tall thin box with legs
		return <boxGeometry args={[0.3, 1.0, 0.3]} />
	} else if (scale >= 1.35) {
		// Flying/heavy — flat disc
		return <cylinderGeometry args={[0.5, 0.4, 0.3, 8]} />
	} else if (scale >= 1.15) {
		// Vehicle — box
		return <boxGeometry args={[0.6, 0.4, 0.8]} />
	} else if (scale >= 1.05) {
		// Stalker — tall capsule
		return <capsuleGeometry args={[0.2, 0.7, 4, 8]} />
	} else {
		// Standard infantry — capsule (marine/zealot)
		return <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
	}
}

function isInfantryOrAbove(scale: number): boolean {
	// Show weapon detail for combat-sized units (not workers)
	return scale > 0.85
}

export function UnitMesh({ transform, health, selection, render }: UnitMeshProps) {
	const healthBarRef = useRef<Group>(null)
	const healthPercent = health.max > 0 ? health.current / health.max : 0
	const modelScale = transform.scale.x

	useFrame(({ camera }) => {
		if (healthBarRef.current) {
			healthBarRef.current.quaternion.copy(camera.quaternion)
		}
	})

	return (
		<group
			position={[transform.position.x, transform.position.y + 0.5, transform.position.z]}
			rotation={[0, transform.rotation, 0]}
		>
			{/* Shadow disc */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
				<circleGeometry args={[0.5 * modelScale, 16]} />
				<meshBasicMaterial color="#000000" transparent opacity={0.3} />
			</mesh>

			{/* Unit body — shape varies by type */}
			<mesh castShadow scale={[modelScale, modelScale, modelScale]}>
				{getUnitGeometry(modelScale)}
				<meshStandardMaterial color={render.color ?? '#4488ff'} />
			</mesh>

			{/* Weapon detail for combat units */}
			{isInfantryOrAbove(modelScale) && (
				<mesh
					castShadow
					position={[0, 0, 0.4 * modelScale]}
					scale={[modelScale, modelScale, modelScale]}
				>
					<boxGeometry args={[0.08, 0.08, 0.25]} />
					<meshStandardMaterial color={render.color ?? '#4488ff'} />
				</mesh>
			)}

			{/* Selection ring */}
			{selection.isSelected && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
					<ringGeometry args={[0.5 * modelScale, 0.6 * modelScale, 32]} />
					<meshBasicMaterial color="#00ff88" transparent opacity={0.8} />
				</mesh>
			)}

			{/* Health bar (billboard) */}
			<group ref={healthBarRef} position={[0, 1.0 * modelScale, 0]}>
				{/* Background */}
				<mesh position={[0, 0, -0.001]}>
					<planeGeometry args={[1.0, 0.1]} />
					<meshBasicMaterial color="#333333" transparent opacity={0.6} />
				</mesh>
				{/* Fill */}
				<mesh position={[(healthPercent - 1) * 0.5, 0, 0]}>
					<planeGeometry args={[1.0 * healthPercent, 0.1]} />
					<meshBasicMaterial color={getHealthColor(healthPercent)} />
				</mesh>

				{/* Shield bar - only for units with shields */}
				{health.maxShields != null && health.maxShields > 0 && (
					<group position={[0, 0.15, 0]}>
						{/* Background */}
						<mesh>
							<planeGeometry args={[1, 0.08]} />
							<meshBasicMaterial color="#222244" />
						</mesh>
						{/* Shield fill */}
						<mesh position={[((health.shields ?? 0) / health.maxShields - 1) * 0.5, 0, 0.01]}>
							<planeGeometry args={[(health.shields ?? 0) / health.maxShields, 0.06]} />
							<meshBasicMaterial color="#4488ff" />
						</mesh>
					</group>
				)}
			</group>
		</group>
	)
}
