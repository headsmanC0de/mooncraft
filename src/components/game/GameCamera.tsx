'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGameStore } from '@/stores/gameStore'
import { GAME_CONFIG } from '@/config'
import * as THREE from 'three'

const keys = new Set<string>()

export function GameCamera() {
	const { camera } = useThree()
	const target = useRef(
		new THREE.Vector3(
			GAME_CONFIG.camera.initialPosition.x,
			0,
			GAME_CONFIG.camera.initialPosition.z,
		),
	)

	useEffect(() => {
		const cam = GAME_CONFIG.camera
		camera.position.set(cam.initialPosition.x, cam.initialPosition.y, cam.initialPosition.z)
		camera.lookAt(target.current)

		const onKeyDown = (e: KeyboardEvent) => keys.add(e.key.toLowerCase())
		const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase())
		const onWheel = (e: WheelEvent) => {
			const zoom = useGameStore.getState().cameraZoom
			const newZoom = THREE.MathUtils.clamp(
				zoom + e.deltaY * 0.05,
				GAME_CONFIG.camera.minZoom,
				GAME_CONFIG.camera.maxZoom,
			)
			useGameStore.getState().setCameraZoom(newZoom)
		}

		window.addEventListener('keydown', onKeyDown)
		window.addEventListener('keyup', onKeyUp)
		window.addEventListener('wheel', onWheel, { passive: true })
		return () => {
			window.removeEventListener('keydown', onKeyDown)
			window.removeEventListener('keyup', onKeyUp)
			window.removeEventListener('wheel', onWheel)
		}
	}, [camera])

	useFrame((_, delta) => {
		const speed = GAME_CONFIG.camera.panSpeed * delta
		const zoom = useGameStore.getState().cameraZoom

		if (keys.has('w') || keys.has('arrowup')) target.current.z -= speed
		if (keys.has('s') || keys.has('arrowdown')) target.current.z += speed
		if (keys.has('a') || keys.has('arrowleft')) target.current.x -= speed
		if (keys.has('d') || keys.has('arrowright')) target.current.x += speed

		const { width, height } = GAME_CONFIG.map
		target.current.x = THREE.MathUtils.clamp(target.current.x, 0, width)
		target.current.z = THREE.MathUtils.clamp(target.current.z, 0, height)

		camera.position.set(
			target.current.x + zoom * 0.7,
			zoom,
			target.current.z + zoom * 0.7,
		)
		camera.lookAt(target.current)

		useGameStore.getState().setCameraPosition({
			x: target.current.x,
			y: 0,
			z: target.current.z,
		})
	})

	return null
}
