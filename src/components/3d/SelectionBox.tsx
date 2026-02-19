'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useSelectionBox } from '@/hooks/useSelectionBox'

function SelectionBoxOverlay() {
  const { selectionBox } = useSelectionBox()

  if (!selectionBox) return null

  const normalized = {
    x: Math.min(selectionBox.start.x, selectionBox.end.x),
    y: Math.min(selectionBox.start.y, selectionBox.end.y),
    width: Math.abs(selectionBox.end.x - selectionBox.start.x),
    height: Math.abs(selectionBox.end.y - selectionBox.start.y),
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: normalized.x,
        top: normalized.y,
        width: normalized.width,
        height: normalized.height,
        border: '2px solid #00ff00',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  )
}

export function SelectionBox() {
  const { gl } = useThree()
  const { handlers } = useSelectionBox()

  useEffect(() => {
    const canvas = gl.domElement

    canvas.addEventListener('pointerdown', handlers.onPointerDown)
    canvas.addEventListener('pointermove', handlers.onPointerMove)
    canvas.addEventListener('pointerup', handlers.onPointerUp)

    return () => {
      canvas.removeEventListener('pointerdown', handlers.onPointerDown)
      canvas.removeEventListener('pointermove', handlers.onPointerMove)
      canvas.removeEventListener('pointerup', handlers.onPointerUp)
    }
  }, [gl, handlers])

  return null
}

export { SelectionBoxOverlay }
