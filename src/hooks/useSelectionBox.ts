import { useCallback, useState, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import type { EntityId, TransformComponent } from '@/types/ecs'
import { normalizeBox, getEntitiesInSelectionBox, type SelectionBox, type ScreenPoint } from '@/utils/selectionUtils'
import { useGameStore } from '@/stores/gameStore'
import { entityManager, componentManager } from '@/lib/ecs'
import { ComponentType } from '@/types/ecs'

export function useSelectionBox() {
  const { camera, gl } = useThree()
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null)
  const startPoint = useRef<ScreenPoint | null>(null)
  
  const selectUnits = useGameStore(state => state.selectUnits)
  const clearSelection = useGameStore(state => state.clearSelection)

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (event.button !== 0) return
    
    startPoint.current = { x: event.clientX, y: event.clientY }
    setIsSelecting(true)
  }, [])

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isSelecting || !startPoint.current) return

    setSelectionBox({
      start: startPoint.current,
      end: { x: event.clientX, y: event.clientY },
    })
  }, [isSelecting])

  const handlePointerUp = useCallback((event: PointerEvent) => {
    if (event.button !== 0) return
    if (!isSelecting || !startPoint.current) {
      setIsSelecting(false)
      return
    }

    const finalBox: SelectionBox = {
      start: startPoint.current,
      end: { x: event.clientX, y: event.clientY },
    }

    const normalized = normalizeBox(finalBox)
    const boxWidth = normalized.end.x - normalized.start.x
    const boxHeight = normalized.end.y - normalized.start.y

    const isAdditive = event.shiftKey

    if (boxWidth < 5 && boxHeight < 5) {
      if (!isAdditive) {
        clearSelection()
      }
    } else {
      const entities = entityManager.getAllEntities()
      const entitiesWithPositions = entities
        .filter(entity => entity.components.has(ComponentType.TRANSFORM))
        .map(entity => {
          const transform = componentManager.getComponent<TransformComponent>(entity.id, ComponentType.TRANSFORM)
          return {
            id: entity.id,
            position: transform?.position ?? { x: 0, y: 0, z: 0 },
          }
        })

      const selectedIds = getEntitiesInSelectionBox(
        entitiesWithPositions,
        finalBox,
        camera,
        gl.domElement
      )

      selectUnits(selectedIds, isAdditive)
    }

    setIsSelecting(false)
    setSelectionBox(null)
    startPoint.current = null
  }, [isSelecting, selectUnits, clearSelection, camera, gl])

  return {
    isSelecting,
    selectionBox,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
  }
}
