import { describe, it, expect, beforeEach } from 'vitest'
import { normalizeBox, screenToWorld, isEntityInSelectionBox, getEntitiesInSelectionBox } from '@/utils/selectionUtils'
import * as THREE from 'three'

describe('SelectionBox Utils', () => {
  describe('normalizeBox', () => {
    it('should normalize selection box coordinates', () => {
      const box = {
        start: { x: 100, y: 100 },
        end: { x: 50, y: 50 },
      }
      
      const normalized = normalizeBox(box)
      
      expect(normalized.start.x).toBe(50)
      expect(normalized.start.y).toBe(50)
      expect(normalized.end.x).toBe(100)
      expect(normalized.end.y).toBe(100)
    })

    it('should return same box if already normalized', () => {
      const box = {
        start: { x: 50, y: 50 },
        end: { x: 100, y: 100 },
      }
      
      const normalized = normalizeBox(box)
      
      expect(normalized.start.x).toBe(50)
      expect(normalized.end.x).toBe(100)
    })
  })

  describe('screenToWorld', () => {
    it('should convert screen coordinates to world coordinates', () => {
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
      camera.position.set(40, 50, 40)
      camera.lookAt(40, 0, 40)
      
      const canvas = {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 800,
          height: 600,
        }),
      } as HTMLCanvasElement
      
      const result = screenToWorld({ x: 400, y: 300 }, camera, canvas)
      
      expect(result).not.toBeNull()
      expect(typeof result!.x).toBe('number')
      expect(typeof result!.z).toBe('number')
    })
  })

  describe('isEntityInSelectionBox', () => {
    let camera: THREE.PerspectiveCamera
    let canvas: HTMLCanvasElement

    beforeEach(() => {
      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
      camera.position.set(40, 50, 40)
      camera.lookAt(40, 0, 40)
      camera.updateMatrixWorld()
      
      canvas = {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 800,
          height: 600,
        }),
      } as HTMLCanvasElement
    })

    it('should detect entity inside selection box', () => {
      const entityPos = { x: 40, y: 0, z: 40 }
      const box = {
        start: { x: 350, y: 250 },
        end: { x: 450, y: 350 },
      }
      
      const isInBox = isEntityInSelectionBox(entityPos, box, camera, canvas)
      
      expect(isInBox).toBe(true)
    })

    it('should detect entity outside selection box', () => {
      const entityPos = { x: 100, y: 0, z: 100 }
      const box = {
        start: { x: 100, y: 100 },
        end: { x: 200, y: 200 },
      }
      
      const isInBox = isEntityInSelectionBox(entityPos, box, camera, canvas)
      
      expect(isInBox).toBe(false)
    })
  })

  describe('getEntitiesInSelectionBox', () => {
    let camera: THREE.PerspectiveCamera
    let canvas: HTMLCanvasElement

    beforeEach(() => {
      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
      camera.position.set(40, 50, 40)
      camera.lookAt(40, 0, 40)
      camera.updateMatrixWorld()
      
      canvas = {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 800,
          height: 600,
        }),
      } as HTMLCanvasElement
    })

    it('should return entity IDs within selection box', () => {
      const entities = [
        { id: 'entity1', position: { x: 40, y: 0, z: 40 } },
        { id: 'entity2', position: { x: 100, y: 0, z: 100 } },
      ]
      
      const box = {
        start: { x: 350, y: 250 },
        end: { x: 450, y: 350 },
      }
      
      const result = getEntitiesInSelectionBox(entities, box, camera, canvas)
      
      expect(result).toContain('entity1')
      expect(result).not.toContain('entity2')
    })

    it('should return empty array if no entities in box', () => {
      const entities = [
        { id: 'entity1', position: { x: 100, y: 0, z: 100 } },
        { id: 'entity2', position: { x: 150, y: 0, z: 150 } },
      ]
      
      const box = {
        start: { x: 100, y: 100 },
        end: { x: 200, y: 200 },
      }
      
      const result = getEntitiesInSelectionBox(entities, box, camera, canvas)
      
      expect(result).toHaveLength(0)
    })
  })
})
