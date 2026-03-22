'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { ResourceComponent, TransformComponent } from '@/types/ecs'

interface MineralMeshProps {
	transform: TransformComponent
	resource: ResourceComponent
}

export function MineralMesh({ transform, resource }: MineralMeshProps) {
	const groupRef = useRef<Group>(null)
	const isDepleted = resource.amount <= 0
	const resourceScale =
		resource.maxCapacity > 0
			? 0.4 + 0.6 * (resource.amount / resource.maxCapacity)
			: 1

	useFrame((_, delta) => {
		if (groupRef.current) {
			groupRef.current.rotation.y += delta * 0.5
		}
	})

	const color = isDepleted ? '#666666' : '#44aaff'
	const emissive = isDepleted ? '#222222' : '#2266aa'
	const emissiveIntensity = isDepleted ? 0.1 : 0.5

	return (
		<group position={[transform.position.x, transform.position.y + 0.6, transform.position.z]}>
			<group ref={groupRef} scale={resourceScale}>
				{/* Main crystal */}
				<mesh castShadow>
					<octahedronGeometry args={[0.6, 0]} />
					<meshStandardMaterial
						color={color}
						emissive={emissive}
						emissiveIntensity={emissiveIntensity}
						roughness={0.3}
						metalness={0.6}
					/>
				</mesh>

				{/* Secondary crystal (smaller, offset) */}
				<mesh castShadow position={[0.35, -0.15, 0.2]} rotation={[0.3, 0.5, 0.2]}>
					<octahedronGeometry args={[0.35, 0]} />
					<meshStandardMaterial
						color={color}
						emissive={emissive}
						emissiveIntensity={emissiveIntensity}
						roughness={0.3}
						metalness={0.6}
					/>
				</mesh>

				{/* Third crystal (smallest, other side) */}
				<mesh castShadow position={[-0.3, -0.2, -0.15]} rotation={[0.1, -0.4, 0.3]}>
					<octahedronGeometry args={[0.25, 0]} />
					<meshStandardMaterial
						color={color}
						emissive={emissive}
						emissiveIntensity={emissiveIntensity}
						roughness={0.3}
						metalness={0.6}
					/>
				</mesh>
			</group>
		</group>
	)
}
