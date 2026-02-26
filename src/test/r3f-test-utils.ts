/**
 * React Three Fiber Test Utilities
 * 
 * Helper functions for testing R3F components and Three.js objects
 * Following the project's testing patterns from SelectionBox.test.ts
 */

import * as THREE from 'three'
import type { ReactElement } from 'react'

// ============================================================================
// Three.js Object Factories
// ============================================================================

/**
 * Creates a standard RTS camera setup for testing
 * Matches the camera configuration in GameScene.tsx
 */
export function createTestCamera(options: {
  position?: [number, number, number]
  fov?: number
  aspect?: number
  near?: number
  far?: number
} = {}): THREE.PerspectiveCamera {
  const {
    position = [40, 50, 40],
    fov = 45,
    aspect = 1,
    near = 0.1,
    far = 1000,
  } = options

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.set(position[0], position[1], position[2])
  camera.lookAt(position[0], 0, position[2])
  camera.updateMatrixWorld(true) // Critical for projection calculations
  
  return camera
}

/**
 * Creates a mock canvas element for testing
 * Provides getBoundingClientRect for coordinate calculations
 */
export function createMockCanvas(options: {
  left?: number
  top?: number
  width?: number
  height?: number
} = {}): HTMLCanvasElement {
  const {
    left = 0,
    top = 0,
    width = 800,
    height = 600,
  } = options

  return {
    getBoundingClientRect: () => ({
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      x: left,
      y: top,
      toJSON: () => ({}),
    }),
  } as HTMLCanvasElement
}

/**
 * Creates a test scene with basic setup
 */
export function createTestScene(): THREE.Scene {
  const scene = new THREE.Scene()
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  return scene
}

/**
 * Creates a test renderer (WebGL not required for most tests)
 */
export function createTestRenderer(
  width = 800,
  height = 600
): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  return renderer
}

// ============================================================================
// Raycasting Utilities
// ============================================================================

/**
 * Performs a raycast from screen coordinates
 * Useful for testing object selection
 */
export function raycastFromScreen(
  screenX: number,
  screenY: number,
  camera: THREE.Camera,
  canvas: HTMLCanvasElement,
  objects: THREE.Object3D[]
): THREE.Intersection[] {
  const rect = canvas.getBoundingClientRect()
  
  // Convert screen coords to normalized device coords (-1 to 1)
  const mouse = new THREE.Vector2(
    ((screenX - rect.left) / rect.width) * 2 - 1,
    -((screenY - rect.top) / rect.height) * 2 + 1
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  return raycaster.intersectObjects(objects, true)
}

/**
 * Creates a raycaster for testing
 */
export function createTestRaycaster(
  origin: THREE.Vector3,
  direction: THREE.Vector3
): THREE.Raycaster {
  const raycaster = new THREE.Raycaster()
  raycaster.set(origin, direction.normalize())
  return raycaster
}

// ============================================================================
// Geometry Helpers
// ============================================================================

/**
 * Creates a simple test mesh for selection testing
 */
export function createTestMesh(options: {
  position?: [number, number, number]
  geometry?: 'box' | 'sphere' | 'plane'
  name?: string
} = {}): THREE.Mesh {
  const { position = [0, 0, 0], geometry = 'box', name } = options

  let geo: THREE.BufferGeometry
  switch (geometry) {
    case 'sphere':
      geo = new THREE.SphereGeometry(1, 16, 16)
      break
    case 'plane':
      geo = new THREE.PlaneGeometry(1, 1)
      break
    default:
      geo = new THREE.BoxGeometry(1, 1, 1)
  }

  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  const mesh = new THREE.Mesh(geo, material)
  mesh.position.set(position[0], position[1], position[2])
  if (name) mesh.name = name
  
  return mesh
}

/**
 * Creates a ground plane for RTS testing
 */
export function createTestGroundPlane(size = 160): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(size, size)
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x1a2a1a,
    roughness: 0.9,
  })
  const plane = new THREE.Mesh(geometry, material)
  plane.rotation.x = -Math.PI / 2
  plane.position.set(size / 2, 0, size / 2)
  return plane
}

// ============================================================================
// Coordinate Conversion
// ============================================================================

/**
 * Converts world position to screen coordinates
 */
export function worldToScreen(
  worldPos: THREE.Vector3 | { x: number; y: number; z: number },
  camera: THREE.Camera,
  canvas: HTMLCanvasElement
): { x: number; y: number } | null {
  const pos = new THREE.Vector3(worldPos.x, worldPos.y, worldPos.z)
  pos.project(camera)

  const rect = canvas.getBoundingClientRect()
  
  return {
    x: (pos.x * 0.5 + 0.5) * rect.width + rect.left,
    y: (-pos.y * 0.5 + 0.5) * rect.height + rect.top,
  }
}

/**
 * Converts screen coordinates to world position on a plane
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: THREE.Camera,
  canvas: HTMLCanvasElement,
  planeY = 0
): THREE.Vector3 | null {
  const rect = canvas.getBoundingClientRect()
  
  const mouse = new THREE.Vector2(
    ((screenX - rect.left) / rect.width) * 2 - 1,
    -((screenY - rect.top) / rect.height) * 2 + 1
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY)
  const intersection = new THREE.Vector3()
  
  if (raycaster.ray.intersectPlane(plane, intersection)) {
    return intersection
  }
  
  return null
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Asserts that a vector is approximately equal to expected values
 */
export function expectVectorApprox(
  actual: THREE.Vector3,
  expected: { x: number; y: number; z: number },
  tolerance = 0.01
): void {
  const diff = Math.abs(actual.x - expected.x) +
               Math.abs(actual.y - expected.y) +
               Math.abs(actual.z - expected.z)
  
  if (diff > tolerance * 3) {
    throw new Error(
      `Vector ${actual.x.toFixed(2)}, ${actual.y.toFixed(2)}, ${actual.z.toFixed(2)} ` +
      `is not approximately equal to ${expected.x}, ${expected.y}, ${expected.z}`
    )
  }
}

/**
 * Asserts that a point is inside a selection box
 */
export function expectPointInBox(
  point: { x: number; y: number },
  box: { start: { x: number; y: number }; end: { x: number; y: number } }
): void {
  const minX = Math.min(box.start.x, box.end.x)
  const maxX = Math.max(box.start.x, box.end.x)
  const minY = Math.min(box.start.y, box.end.y)
  const maxY = Math.max(box.start.y, box.end.y)

  if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
    throw new Error(
      `Point (${point.x}, ${point.y}) is not inside box ` +
      `[${minX}-${maxX}, ${minY}-${maxY}]`
    )
  }
}

// ============================================================================
// Mock Event Helpers
// ============================================================================

/**
 * Creates a mock pointer event for testing
 */
export function createMockPointerEvent(
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  options: {
    clientX: number
    clientY: number
    button?: number
    shiftKey?: boolean
    ctrlKey?: boolean
  }
): PointerEvent {
  return new PointerEvent(type, {
    clientX: options.clientX,
    clientY: options.clientY,
    button: options.button ?? 0,
    shiftKey: options.shiftKey ?? false,
    ctrlKey: options.ctrlKey ?? false,
    bubbles: true,
    cancelable: true,
  })
}

/**
 * Creates a mock keyboard event for testing
 */
export function createMockKeyboardEvent(
  type: 'keydown' | 'keyup',
  key: string,
  options: {
    shiftKey?: boolean
    ctrlKey?: boolean
    altKey?: boolean
  } = {}
): KeyboardEvent {
  return new KeyboardEvent(type, {
    key,
    shiftKey: options.shiftKey ?? false,
    ctrlKey: options.ctrlKey ?? false,
    altKey: options.altKey ?? false,
    bubbles: true,
    cancelable: true,
  })
}

// ============================================================================
// Test Fixture Builders
// ============================================================================

/**
 * Creates a complete test fixture with camera, canvas, and scene
 */
export function createTestFixture(options: {
  canvasWidth?: number
  canvasHeight?: number
  cameraPosition?: [number, number, number]
} = {}) {
  const camera = createTestCamera({
    position: options.cameraPosition,
    aspect: (options.canvasWidth ?? 800) / (options.canvasHeight ?? 600),
  })
  
  const canvas = createMockCanvas({
    width: options.canvasWidth,
    height: options.canvasHeight,
  })
  
  const scene = createTestScene()
  
  return {
    camera,
    canvas,
    scene,
    // Convenience methods
    screenToWorld: (x: number, y: number) => screenToWorld(x, y, camera, canvas),
    worldToScreen: (pos: { x: number; y: number; z: number }) => worldToScreen(pos, camera, canvas),
    raycast: (x: number, y: number, objects: THREE.Object3D[]) => 
      raycastFromScreen(x, y, camera, canvas, objects),
  }
}

export type TestFixture = ReturnType<typeof createTestFixture>
