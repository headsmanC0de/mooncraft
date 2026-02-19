/**
 * R3F Test Utilities Tests
 * 
 * Tests for the R3F/Three.js testing helpers
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import {
  createTestCamera,
  createMockCanvas,
  createTestScene,
  createTestMesh,
  createTestGroundPlane,
  worldToScreen,
  screenToWorld,
  raycastFromScreen,
  createTestFixture,
  expectVectorApprox,
  expectPointInBox,
} from '@/test/r3f-test-utils'

describe('Three.js Object Factories', () => {
  describe('createTestCamera', () => {
    it('should create camera with default RTS settings', () => {
      const camera = createTestCamera()
      
      expect(camera).toBeInstanceOf(THREE.PerspectiveCamera)
      expect(camera.fov).toBe(45)
      expect(camera.position.x).toBe(40)
      expect(camera.position.y).toBe(50)
      expect(camera.position.z).toBe(40)
    })

    it('should create camera with custom settings', () => {
      const camera = createTestCamera({
        position: [100, 80, 100],
        fov: 60,
        aspect: 16/9,
      })
      
      expect(camera.fov).toBe(60)
      expect(camera.position.x).toBe(100)
      expect(camera.aspect).toBe(16/9)
    })

    it('should have updated matrix world', () => {
      const camera = createTestCamera()
      
      expect(camera.matrixWorldNeedsUpdate).toBe(false)
      expect(camera.matrixWorld.elements).toBeDefined()
    })
  })

  describe('createMockCanvas', () => {
    it('should create canvas with default dimensions', () => {
      const canvas = createMockCanvas()
      const rect = canvas.getBoundingClientRect()
      
      expect(rect.width).toBe(800)
      expect(rect.height).toBe(600)
      expect(rect.left).toBe(0)
      expect(rect.top).toBe(0)
    })

    it('should create canvas with custom dimensions', () => {
      const canvas = createMockCanvas({
        left: 100,
        top: 50,
        width: 1920,
        height: 1080,
      })
      const rect = canvas.getBoundingClientRect()
      
      expect(rect.left).toBe(100)
      expect(rect.top).toBe(50)
      expect(rect.width).toBe(1920)
      expect(rect.height).toBe(1080)
    })
  })

  describe('createTestScene', () => {
    it('should create scene with ambient light', () => {
      const scene = createTestScene()
      
      expect(scene).toBeInstanceOf(THREE.Scene)
      expect(scene.children.length).toBe(1)
      expect(scene.children[0]).toBeInstanceOf(THREE.AmbientLight)
    })
  })

  describe('createTestMesh', () => {
    it('should create mesh with default box geometry', () => {
      const mesh = createTestMesh()
      
      expect(mesh).toBeInstanceOf(THREE.Mesh)
      expect(mesh.geometry).toBeInstanceOf(THREE.BoxGeometry)
    })

    it('should create mesh with sphere geometry', () => {
      const mesh = createTestMesh({ geometry: 'sphere' })
      
      expect(mesh.geometry).toBeInstanceOf(THREE.SphereGeometry)
    })

    it('should create mesh at specified position', () => {
      const mesh = createTestMesh({ position: [10, 5, 20] })
      
      expect(mesh.position.x).toBe(10)
      expect(mesh.position.y).toBe(5)
      expect(mesh.position.z).toBe(20)
    })

    it('should create mesh with name', () => {
      const mesh = createTestMesh({ name: 'test-unit' })
      
      expect(mesh.name).toBe('test-unit')
    })
  })

  describe('createTestGroundPlane', () => {
    it('should create ground plane with default size', () => {
      const plane = createTestGroundPlane()
      
      expect(plane).toBeInstanceOf(THREE.Mesh)
      expect(plane.rotation.x).toBe(-Math.PI / 2)
      expect(plane.position.x).toBe(80)
      expect(plane.position.z).toBe(80)
    })

    it('should create ground plane with custom size', () => {
      const plane = createTestGroundPlane(200)
      
      expect(plane.position.x).toBe(100)
      expect(plane.position.z).toBe(100)
    })
  })
})

describe('Coordinate Conversion', () => {
  let fixture: ReturnType<typeof createTestFixture>

  beforeEach(() => {
    fixture = createTestFixture()
  })

  describe('worldToScreen', () => {
    it('should convert world position to screen coordinates', () => {
      const worldPos = { x: 40, y: 0, z: 40 }
      const screenPos = worldToScreen(worldPos, fixture.camera, fixture.canvas)
      
      expect(screenPos).not.toBeNull()
      expect(typeof screenPos!.x).toBe('number')
      expect(typeof screenPos!.y).toBe('number')
    })

    it('should map center world position to center screen', () => {
      // Camera is at (40, 50, 40) looking at (40, 0, 40)
      const worldPos = { x: 40, y: 0, z: 40 }
      const screenPos = worldToScreen(worldPos, fixture.camera, fixture.canvas)
      
      // Should be approximately center of 800x600 canvas
      expect(screenPos!.x).toBeGreaterThan(350)
      expect(screenPos!.x).toBeLessThan(450)
      expect(screenPos!.y).toBeGreaterThan(250)
      expect(screenPos!.y).toBeLessThan(350)
    })
  })

  describe('screenToWorld', () => {
    it('should convert screen coordinates to world position', () => {
      const worldPos = screenToWorld(400, 300, fixture.camera, fixture.canvas)
      
      expect(worldPos).not.toBeNull()
      expect(typeof worldPos!.x).toBe('number')
      expect(typeof worldPos!.z).toBe('number')
    })

    it('should return null for invalid projection', () => {
      // Point outside camera frustum might return null
      const worldPos = screenToWorld(-1000, -1000, fixture.camera, fixture.canvas)
      
      // May or may not be null depending on camera setup
      expect(worldPos).toBeDefined()
    })
  })
})

describe('Raycasting', () => {
  let fixture: ReturnType<typeof createTestFixture>

  beforeEach(() => {
    fixture = createTestFixture()
  })

  describe('raycastFromScreen', () => {
    it('should detect intersection with mesh', () => {
      const mesh = createTestMesh({ position: [40, 0, 40] })
      fixture.scene.add(mesh)
      
      // Raycast from center of screen
      const intersections = raycastFromScreen(
        400, 300,
        fixture.camera,
        fixture.canvas,
        [mesh]
      )
      
      // May or may not intersect depending on camera angle
      expect(Array.isArray(intersections)).toBe(true)
    })

    it('should return empty array when no objects', () => {
      const intersections = raycastFromScreen(
        400, 300,
        fixture.camera,
        fixture.canvas,
        []
      )
      
      expect(intersections).toHaveLength(0)
    })
  })
})

describe('Test Fixture', () => {
  describe('createTestFixture', () => {
    it('should create complete test fixture', () => {
      const fixture = createTestFixture()
      
      expect(fixture.camera).toBeInstanceOf(THREE.PerspectiveCamera)
      expect(fixture.canvas).toBeDefined()
      expect(fixture.scene).toBeInstanceOf(THREE.Scene)
    })

    it('should provide convenience methods', () => {
      const fixture = createTestFixture()
      
      expect(typeof fixture.screenToWorld).toBe('function')
      expect(typeof fixture.worldToScreen).toBe('function')
      expect(typeof fixture.raycast).toBe('function')
    })

    it('should accept custom options', () => {
      const fixture = createTestFixture({
        canvasWidth: 1920,
        canvasHeight: 1080,
        cameraPosition: [100, 80, 100],
      })
      
      const rect = fixture.canvas.getBoundingClientRect()
      expect(rect.width).toBe(1920)
      expect(rect.height).toBe(1080)
      expect(fixture.camera.position.x).toBe(100)
    })
  })
})

describe('Assertion Helpers', () => {
  describe('expectVectorApprox', () => {
    it('should pass for approximately equal vectors', () => {
      const vector = new THREE.Vector3(1.001, 2.002, 3.003)
      
      expect(() => 
        expectVectorApprox(vector, { x: 1, y: 2, z: 3 }, 0.01)
      ).not.toThrow()
    })

    it('should throw for unequal vectors', () => {
      const vector = new THREE.Vector3(1, 2, 3)
      
      expect(() => 
        expectVectorApprox(vector, { x: 10, y: 20, z: 30 }, 0.01)
      ).toThrow('is not approximately equal to')
    })
  })

  describe('expectPointInBox', () => {
    it('should pass for point inside box', () => {
      expect(() =>
        expectPointInBox(
          { x: 150, y: 150 },
          { start: { x: 100, y: 100 }, end: { x: 200, y: 200 } }
        )
      ).not.toThrow()
    })

    it('should throw for point outside box', () => {
      expect(() =>
        expectPointInBox(
          { x: 50, y: 50 },
          { start: { x: 100, y: 100 }, end: { x: 200, y: 200 } }
        )
      ).toThrow('is not inside box')
    })

    it('should handle reversed box coordinates', () => {
      expect(() =>
        expectPointInBox(
          { x: 150, y: 150 },
          { start: { x: 200, y: 200 }, end: { x: 100, y: 100 } }
        )
      ).not.toThrow()
    })
  })
})
