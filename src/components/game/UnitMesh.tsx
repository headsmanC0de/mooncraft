'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
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

export function UnitMesh({ transform, health, selection, render }: UnitMeshProps) {
	const healthBarRef = useRef<Group>(null)
	const healthPercent = health.max > 0 ? health.current / health.max : 0

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
			{/* Capsule body */}
			<mesh castShadow>
				<capsuleGeometry args={[0.3, 0.6, 4, 8]} />
				<meshStandardMaterial color={render.color ?? '#4488ff'} />
			</mesh>

			{/* Selection ring */}
			{selection.isSelected && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
					<ringGeometry args={[0.5, 0.6, 32]} />
					<meshBasicMaterial color="#00ff88" transparent opacity={0.8} />
				</mesh>
			)}

			{/* Health bar (billboard) */}
			<group ref={healthBarRef} position={[0, 1.0, 0]}>
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
			</group>
		</group>
	)
}
