import * as THREE from 'three'
import type { EntityId } from '@/types/ecs'

export interface ScreenPoint {
  x: number
  y: number
}

export interface SelectionBox {
  start: ScreenPoint
  end: ScreenPoint
}

export function normalizeBox(box: SelectionBox): SelectionBox {
  return {
    start: {
      x: Math.min(box.start.x, box.end.x),
      y: Math.min(box.start.y, box.end.y),
    },
    end: {
      x: Math.max(box.start.x, box.end.x),
      y: Math.max(box.start.y, box.end.y),
    },
  }
}

export function screenToWorld(
  point: ScreenPoint,
  camera: THREE.Camera,
  canvas: HTMLCanvasElement
): THREE.Vector3 | null {
  const rect = canvas.getBoundingClientRect()
  const mouse = new THREE.Vector2(
    ((point.x - rect.left) / rect.width) * 2 - 1,
    -((point.y - rect.top) / rect.height) * 2 + 1
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const intersection = new THREE.Vector3()
  
  raycaster.ray.intersectPlane(plane, intersection)
  
  return intersection
}

export function isEntityInSelectionBox(
  entityPosition: { x: number; y: number; z: number },
  box: SelectionBox,
  camera: THREE.Camera,
  canvas: HTMLCanvasElement
): boolean {
  const screenPos = worldToScreen(entityPosition, camera, canvas)
  if (!screenPos) return false

  const normalized = normalizeBox(box)

  return (
    screenPos.x >= normalized.start.x &&
    screenPos.x <= normalized.end.x &&
    screenPos.y >= normalized.start.y &&
    screenPos.y <= normalized.end.y
  )
}

function worldToScreen(
  worldPos: { x: number; y: number; z: number },
  camera: THREE.Camera,
  canvas: HTMLCanvasElement
): ScreenPoint | null {
  const pos = new THREE.Vector3(worldPos.x, worldPos.y, worldPos.z)
  pos.project(camera)

  const rect = canvas.getBoundingClientRect()
  
  return {
    x: (pos.x * 0.5 + 0.5) * rect.width + rect.left,
    y: (-pos.y * 0.5 + 0.5) * rect.height + rect.top,
  }
}

export function getEntitiesInSelectionBox(
  entities: Array<{ id: EntityId; position: { x: number; y: number; z: number } }>,
  box: SelectionBox,
  camera: THREE.Camera,
  canvas: HTMLCanvasElement
): EntityId[] {
  return entities
    .filter(entity => isEntityInSelectionBox(entity.position, box, camera, canvas))
    .map(entity => entity.id)
}
