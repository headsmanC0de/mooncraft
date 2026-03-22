'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { ResourceComponent, TransformComponent } from '@/types/ecs'

interface MineralMeshProps {
	transform: TransformComponent
	resource: ResourceComponent
}

export function MineralMesh({ transform, resource }: MineralMeshProps) {
	const meshRef = useRef<Mesh>(null)
	const isDepleted = resource.amount <= 0
	const resourceScale =
		resource.maxCapacity > 0
			? 0.4 + 0.6 * (resource.amount / resource.maxCapacity)
			: 1

	useFrame((_, delta) => {
		if (meshRef.current) {
			meshRef.current.rotation.y += delta * 0.5
		}
	})

	return (
		<group position={[transform.position.x, transform.position.y + 0.6, transform.position.z]}>
			<mesh ref={meshRef} scale={resourceScale} castShadow>
				<octahedronGeometry args={[0.6, 0]} />
				<meshStandardMaterial
					color={isDepleted ? '#666666' : '#44aaff'}
					emissive={isDepleted ? '#222222' : '#2266aa'}
					emissiveIntensity={isDepleted ? 0.1 : 0.5}
					roughness={0.3}
					metalness={0.6}
				/>
			</mesh>
		</group>
	)
}
