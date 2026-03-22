'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
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
		resource.maxCapacity > 0 ? 0.4 + 0.6 * (resource.amount / resource.maxCapacity) : 1
	const isGas = resource.resourceType === 'gas'

	useFrame((state, delta) => {
		if (groupRef.current) {
			groupRef.current.rotation.y += delta * (isGas ? 0.2 : 0.5)
			if (isGas) {
				groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1
			}
		}
	})

	const baseColor = isGas ? '#44cc44' : '#44aaff'
	const baseEmissive = isGas ? '#226622' : '#2266aa'
	const color = isDepleted ? '#666666' : baseColor
	const emissive = isDepleted ? '#222222' : baseEmissive
	const emissiveIntensity = isDepleted ? 0.1 : 0.5

	if (isGas) {
		return (
			<group position={[transform.position.x, transform.position.y + 1.2, transform.position.z]}>
				<group ref={groupRef} scale={resourceScale}>
					{/* Main geyser column */}
					<mesh castShadow>
						<icosahedronGeometry args={[1.0, 1]} />
						<meshStandardMaterial
							color={color}
							emissive={emissive}
							emissiveIntensity={emissiveIntensity * 1.5}
							roughness={0.2}
							metalness={0.4}
							transparent
							opacity={0.85}
						/>
					</mesh>

					{/* Inner glow core */}
					<mesh>
						<icosahedronGeometry args={[0.6, 1]} />
						<meshStandardMaterial
							color={color}
							emissive={emissive}
							emissiveIntensity={1.2}
							roughness={0.1}
							metalness={0.2}
							transparent
							opacity={0.6}
						/>
					</mesh>
				</group>
			</group>
		)
	}

	return (
		<group position={[transform.position.x, transform.position.y + 0.8, transform.position.z]}>
			<group ref={groupRef} scale={resourceScale}>
				{/* Main crystal */}
				<mesh castShadow>
					<octahedronGeometry args={[0.8, 0]} />
					<meshStandardMaterial
						color={color}
						emissive={emissive}
						emissiveIntensity={emissiveIntensity}
						roughness={0.3}
						metalness={0.6}
					/>
				</mesh>

				{/* Secondary crystal (smaller, offset) */}
				<mesh castShadow position={[0.45, -0.2, 0.25]} rotation={[0.3, 0.5, 0.2]}>
					<octahedronGeometry args={[0.45, 0]} />
					<meshStandardMaterial
						color={color}
						emissive={emissive}
						emissiveIntensity={emissiveIntensity}
						roughness={0.3}
						metalness={0.6}
					/>
				</mesh>

				{/* Third crystal (smallest, other side) */}
				<mesh castShadow position={[-0.4, -0.25, -0.2]} rotation={[0.1, -0.4, 0.3]}>
					<octahedronGeometry args={[0.35, 0]} />
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
