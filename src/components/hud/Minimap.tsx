'use client'

import { useCallback, useEffect, useRef } from 'react'
import { entityManager } from '@/lib/ecs'
import { useGameStore } from '@/stores/gameStore'
import type {
	BuildingComponent,
	OwnerComponent,
	ResourceComponent,
	TransformComponent,
} from '@/types/ecs'
import { ComponentType } from '@/types/ecs'

const MAP_SIZE = 128
const CANVAS_SIZE = 160
const SCALE = CANVAS_SIZE / MAP_SIZE

export function Minimap() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const setCameraPosition = useGameStore((s) => s.setCameraPosition)
	const cameraPosition = useGameStore((s) => s.cameraPosition)
	const cameraZoom = useGameStore((s) => s.cameraZoom)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		let animId: number

		function draw() {
			if (!ctx) return
			// Clear
			ctx.fillStyle = 'rgba(20, 30, 20, 1)'
			ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

			// Draw all entities
			const entities = entityManager.getAllEntities()
			for (const entity of entities) {
				const transform = entity.components.get(ComponentType.TRANSFORM) as
					| TransformComponent
					| undefined
				if (!transform) continue

				const x = transform.position.x * SCALE
				const y = transform.position.z * SCALE

				const resource = entity.components.get(ComponentType.RESOURCE) as
					| ResourceComponent
					| undefined
				const owner = entity.components.get(ComponentType.OWNER) as OwnerComponent | undefined
				const building = entity.components.get(ComponentType.BUILDING) as
					| BuildingComponent
					| undefined

				if (resource) {
					// Mineral/gas: blue dot
					ctx.fillStyle = resource.resourceType === 'mineral' ? '#4488ff' : '#44ff88'
					ctx.fillRect(x - 1, y - 1, 3, 3)
				} else if (building) {
					// Building: larger square
					ctx.fillStyle = owner?.playerId === 'player1' ? '#44cc44' : '#cc4444'
					ctx.fillRect(x - 3, y - 3, 6, 6)
				} else if (owner) {
					// Unit: small dot
					ctx.fillStyle = owner.playerId === 'player1' ? '#44ff44' : '#ff4444'
					ctx.beginPath()
					ctx.arc(x, y, 2, 0, Math.PI * 2)
					ctx.fill()
				}
			}

			// Draw camera viewport rectangle
			const camX = cameraPosition.x * SCALE
			const camZ = cameraPosition.z * SCALE
			const viewW = cameraZoom * SCALE * 1.5
			const viewH = cameraZoom * SCALE

			ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
			ctx.lineWidth = 1
			ctx.strokeRect(camX - viewW / 2, camZ - viewH / 2, viewW, viewH)

			animId = requestAnimationFrame(draw)
		}

		animId = requestAnimationFrame(draw)

		return () => cancelAnimationFrame(animId)
	}, [cameraPosition, cameraZoom])

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const canvas = canvasRef.current
			if (!canvas) return

			const rect = canvas.getBoundingClientRect()
			const x = (e.clientX - rect.left) / SCALE
			const z = (e.clientY - rect.top) / SCALE

			setCameraPosition({ x, y: cameraPosition.y, z })
		},
		[setCameraPosition, cameraPosition.y],
	)

	return (
		<canvas
			ref={canvasRef}
			aria-label="Game minimap"
			role="img"
			width={CANVAS_SIZE}
			height={CANVAS_SIZE}
			onClick={handleClick}
			style={{
				width: CANVAS_SIZE,
				height: CANVAS_SIZE,
				background: 'rgba(20, 30, 20, 0.9)',
				border: '1px solid rgba(255,255,255,0.15)',
				borderRadius: 4,
				cursor: 'crosshair',
				pointerEvents: 'auto',
			}}
		/>
	)
}
