'use client'

// When gameStore.placementMode is not null (e.g., 'barracks'):
// 1. Show a semi-transparent building mesh at the cursor position
// 2. Follow cursor via raycasting to ground plane
// 3. Left-click to place:
//    - Check player has enough resources
//    - Deduct resources from player
//    - Create building entity via EntityFactory at click position
//    - Exit placement mode
// 4. ESC or right-click to cancel placement mode

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { getBuildingDef } from '@/config/buildings'
import { useGameStore } from '@/stores/gameStore'

export function BuildingPlacer() {
	const { camera, gl } = useThree()
	const ghostRef = useRef<THREE.Mesh>(null)
	const placementMode = useGameStore((state) => state.placementMode)
	const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
	const cursorPos = useRef(new THREE.Vector3())

	// Update ghost position on mouse move
	useEffect(() => {
		if (!placementMode) return

		const onMouseMove = (e: MouseEvent) => {
			const rect = gl.domElement.getBoundingClientRect()
			const mouse = new THREE.Vector2(
				((e.clientX - rect.left) / rect.width) * 2 - 1,
				-((e.clientY - rect.top) / rect.height) * 2 + 1,
			)
			const raycaster = new THREE.Raycaster()
			raycaster.setFromCamera(mouse, camera)
			const hit = new THREE.Vector3()
			if (raycaster.ray.intersectPlane(groundPlane.current, hit)) {
				// Snap to grid
				cursorPos.current.set(Math.round(hit.x), 0, Math.round(hit.z))
			}
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				useGameStore.getState().setPlacementMode(null)
			}
		}

		const onClick = (e: MouseEvent) => {
			if (e.button === 0 && placementMode) {
				e.stopPropagation()
				useGameStore.getState().placeBuilding(placementMode, {
					x: cursorPos.current.x,
					y: 0,
					z: cursorPos.current.z,
				})
			}
		}

		const onRightClick = (e: MouseEvent) => {
			if (e.button === 2) {
				useGameStore.getState().setPlacementMode(null)
			}
		}

		const canvas = gl.domElement
		canvas.addEventListener('mousemove', onMouseMove)
		canvas.addEventListener('click', onClick)
		canvas.addEventListener('mousedown', onRightClick)
		window.addEventListener('keydown', onKeyDown)

		return () => {
			canvas.removeEventListener('mousemove', onMouseMove)
			canvas.removeEventListener('click', onClick)
			canvas.removeEventListener('mousedown', onRightClick)
			window.removeEventListener('keydown', onKeyDown)
		}
	}, [placementMode, camera, gl])

	useFrame(() => {
		if (ghostRef.current && placementMode) {
			ghostRef.current.position.copy(cursorPos.current)
			ghostRef.current.position.y = 0.5
		}
	})

	if (!placementMode) return null

	const def = getBuildingDef(placementMode)
	return (
		<mesh ref={ghostRef} position={[0, 0.5, 0]}>
			<boxGeometry args={[def.size.width, 1, def.size.height]} />
			<meshStandardMaterial color={def.color} transparent opacity={0.5} wireframe={false} />
		</mesh>
	)
}
