'use client'

import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { componentManager, entityManager } from '@/lib/ecs'
import { useGameStore } from '@/stores/gameStore'
import type {
	CombatComponent,
	OwnerComponent,
	ResourceComponent,
	TransformComponent,
} from '@/types/ecs'
import { ComponentType } from '@/types/ecs'

export function InputHandler() {
	const { camera, gl } = useThree()
	const raycaster = useRef(new THREE.Raycaster())
	const mouse = useRef(new THREE.Vector2())
	const dragStart = useRef<{ x: number; y: number } | null>(null)
	const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
	const [attackMoveMode, setAttackMoveMode] = useState(false)

	// Helper: get world position from mouse event (raycast to ground plane)
	const getGroundPosition = useCallback(
		(event: MouseEvent): THREE.Vector3 | null => {
			const rect = gl.domElement.getBoundingClientRect()
			mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
			mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
			raycaster.current.setFromCamera(mouse.current, camera)
			const intersection = new THREE.Vector3()
			const hit = raycaster.current.ray.intersectPlane(groundPlane.current, intersection)
			return hit ? intersection : null
		},
		[camera, gl],
	)

	// Helper: find entity near world position
	const findEntityAtPosition = useCallback(
		(worldPos: THREE.Vector3, maxDist = 2): string | null => {
			let closestId: string | null = null
			let closestDist = maxDist

			const entities = entityManager.getAllEntities()
			for (const entity of entities) {
				const transform = componentManager.getComponent<TransformComponent>(
					entity.id,
					ComponentType.TRANSFORM,
				)
				if (!transform) continue

				const dx = transform.position.x - worldPos.x
				const dz = transform.position.z - worldPos.z
				const dist = Math.sqrt(dx * dx + dz * dz)
				if (dist < closestDist) {
					closestDist = dist
					closestId = entity.id
				}
			}
			return closestId
		},
		[],
	)

	useEffect(() => {
		const canvas = gl.domElement

		const onMouseDown = (e: MouseEvent) => {
			if (e.button === 0) {
				dragStart.current = { x: e.clientX, y: e.clientY }
			}
		}

		const onMouseUp = (e: MouseEvent) => {
			if (e.button === 0) {
				const start = dragStart.current
				dragStart.current = null
				if (!start) return

				const dx = e.clientX - start.x
				const dy = e.clientY - start.y
				const dragDist = Math.sqrt(dx * dx + dy * dy)

				if (dragDist < 5) {
					// Attack-move mode: move to position and clear targets for auto-engage
					if (attackMoveMode) {
						const worldPos = getGroundPosition(e)
						if (worldPos) {
							const store = useGameStore.getState()
							store.moveSelectedUnits({ x: worldPos.x, y: 0, z: worldPos.z })
							store.selectedUnits.forEach((unitId) => {
								if (componentManager.hasComponent(unitId, ComponentType.COMBAT)) {
									componentManager.updateComponent(unitId, ComponentType.COMBAT, {
										targetId: null,
									})
								}
							})
						}
						setAttackMoveMode(false)
						return
					}

					// Single click — select entity or clear
					const worldPos = getGroundPosition(e)
					if (!worldPos) return

					const entityId = findEntityAtPosition(worldPos)
					if (entityId) {
						const additive = e.shiftKey
						useGameStore.getState().selectUnits([entityId], additive)
					} else {
						useGameStore.getState().clearSelection()
					}
				} else {
					// Box select — find all player units within screen-space rectangle
					const rect = gl.domElement.getBoundingClientRect()
					const minX = Math.min(start.x, e.clientX)
					const maxX = Math.max(start.x, e.clientX)
					const minY = Math.min(start.y, e.clientY)
					const maxY = Math.max(start.y, e.clientY)

					const ids: string[] = []
					const entities = entityManager.getAllEntities()
					const projected = new THREE.Vector3()

					for (const entity of entities) {
						const transform = componentManager.getComponent<TransformComponent>(
							entity.id,
							ComponentType.TRANSFORM,
						)
						if (!transform) continue

						const owner = componentManager.getComponent<OwnerComponent>(
							entity.id,
							ComponentType.OWNER,
						)
						if (!owner || owner.teamId !== 'team1') continue

						projected.set(transform.position.x, transform.position.y, transform.position.z)
						projected.project(camera)

						const screenX = ((projected.x + 1) / 2) * rect.width + rect.left
						const screenY = ((-projected.y + 1) / 2) * rect.height + rect.top

						if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY) {
							ids.push(entity.id)
						}
					}

					if (ids.length > 0) {
						useGameStore.getState().selectUnits(ids, e.shiftKey)
					}
				}
			}
		}

		const onContextMenu = (e: MouseEvent) => {
			e.preventDefault()
			const worldPos = getGroundPosition(e)
			if (!worldPos) return

			const store = useGameStore.getState()
			if (store.selectedUnits.length === 0) return

			// Check if right-clicking on an entity
			const targetId = findEntityAtPosition(worldPos)
			if (targetId) {
				const owner = componentManager.getComponent<OwnerComponent>(targetId, ComponentType.OWNER)
				const resource = componentManager.getComponent<ResourceComponent>(
					targetId,
					ComponentType.RESOURCE,
				)

				if (resource) {
					// Right-click on mineral — send workers to gather
					store.selectedUnits.forEach((unitId) => {
						const carrier = componentManager.getComponent(unitId, ComponentType.RESOURCE_CARRIER)
						if (carrier) {
							componentManager.updateComponent(unitId, ComponentType.RESOURCE_CARRIER, {
								state: 'gathering',
								targetResourceId: targetId,
								gatherTimer: 0,
							})
							// Move worker to mineral position
							const targetTransform = componentManager.getComponent<TransformComponent>(
								targetId,
								ComponentType.TRANSFORM,
							)
							if (targetTransform) {
								componentManager.updateComponent(unitId, ComponentType.MOVEMENT, {
									targetPosition: { ...targetTransform.position },
								})
							}
						}
					})
					return
				}

				if (owner && owner.teamId !== 'team1') {
					// Right-click on enemy — attack
					store.selectedUnits.forEach((unitId) => {
						const combat = componentManager.getComponent<CombatComponent>(
							unitId,
							ComponentType.COMBAT,
						)
						if (combat) {
							componentManager.updateComponent(unitId, ComponentType.COMBAT, {
								targetId: targetId,
							})
							// Move toward enemy
							const targetTransform = componentManager.getComponent<TransformComponent>(
								targetId,
								ComponentType.TRANSFORM,
							)
							if (targetTransform) {
								componentManager.updateComponent(unitId, ComponentType.MOVEMENT, {
									targetPosition: { ...targetTransform.position },
								})
							}
						}
					})
					return
				}
			}

			// Right-click on ground — move
			store.moveSelectedUnits({ x: worldPos.x, y: 0, z: worldPos.z })
		}

		const onKeyDown = (e: KeyboardEvent) => {
			const store = useGameStore.getState()
			if (store.showPauseMenu || store.gameStatus !== 'playing') return

			// Ctrl + 1-9: save control group
			if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
				e.preventDefault()
				store.setControlGroup(parseInt(e.key, 10))
				return
			}

			// 1-9 (without Ctrl): recall control group
			if (!e.ctrlKey && e.key >= '1' && e.key <= '9') {
				store.recallControlGroup(parseInt(e.key, 10))
				return
			}

			switch (e.key.toLowerCase()) {
				case 'a':
					setAttackMoveMode(true)
					break
				case 's':
					store.stopSelectedUnits()
					break
				case 'h':
					store.stopSelectedUnits()
					break
			}
		}

		window.addEventListener('keydown', onKeyDown)
		canvas.addEventListener('mousedown', onMouseDown)
		canvas.addEventListener('mouseup', onMouseUp)
		canvas.addEventListener('contextmenu', onContextMenu)

		return () => {
			window.removeEventListener('keydown', onKeyDown)
			canvas.removeEventListener('mousedown', onMouseDown)
			canvas.removeEventListener('mouseup', onMouseUp)
			canvas.removeEventListener('contextmenu', onContextMenu)
		}
	}, [camera, gl, getGroundPosition, findEntityAtPosition, attackMoveMode])

	if (attackMoveMode) {
		gl.domElement.style.cursor = 'crosshair'
	} else {
		gl.domElement.style.cursor = ''
	}

	return null
}
