'use client'

import { useMemo } from 'react'
import { GAME_CONFIG } from '@/config'
import * as THREE from 'three'

export function Terrain() {
	const { width, height } = GAME_CONFIG.map

	const gridHelper = useMemo(() => {
		const grid = new THREE.GridHelper(width, width, '#2a3a2a', '#1a2a1a')
		grid.position.set(width / 2, 0.01, height / 2)
		return grid
	}, [width, height])

	const terrainTexture = useMemo(() => {
		const size = 512
		const canvas = document.createElement('canvas')
		canvas.width = size
		canvas.height = size
		const ctx = canvas.getContext('2d')!
		ctx.fillStyle = '#1e2e1e'
		ctx.fillRect(0, 0, size, size)

		// Subtle noise-like color variation
		for (let x = 0; x < size; x += 4) {
			for (let y = 0; y < size; y += 4) {
				const noise = Math.sin(x * 0.05) * Math.cos(y * 0.07) * 0.5
					+ Math.sin(x * 0.13 + y * 0.09) * 0.3
					+ Math.random() * 0.2
				const brightness = Math.floor(28 + noise * 12)
				const green = Math.floor(42 + noise * 16)
				ctx.fillStyle = `rgb(${brightness}, ${green}, ${brightness})`
				ctx.fillRect(x, y, 4, 4)
			}
		}

		const texture = new THREE.CanvasTexture(canvas)
		texture.wrapS = THREE.RepeatWrapping
		texture.wrapT = THREE.RepeatWrapping
		texture.repeat.set(8, 8)
		return texture
	}, [])

	return (
		<group>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, -0.01, height / 2]} receiveShadow>
				<planeGeometry args={[width, height]} />
				<meshStandardMaterial map={terrainTexture} roughness={0.9} metalness={0.1} />
			</mesh>
			<primitive object={gridHelper} />
		</group>
	)
}
