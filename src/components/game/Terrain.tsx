'use client'

import { useMemo } from 'react'
import { GAME_CONFIG } from '@/config'
import * as THREE from 'three'

export function Terrain() {
	const { width, height } = GAME_CONFIG.map

	const gridHelper = useMemo(() => {
		const grid = new THREE.GridHelper(width, width, '#1a2a1a', '#0d1a0d')
		grid.position.set(width / 2, 0, height / 2)
		return grid
	}, [width, height])

	return (
		<group>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, -0.01, height / 2]} receiveShadow>
				<planeGeometry args={[width, height]} />
				<meshStandardMaterial color="#1a2a1a" roughness={0.9} metalness={0.1} />
			</mesh>
			<primitive object={gridHelper} />
		</group>
	)
}
