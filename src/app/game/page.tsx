'use client'

import { GameScene } from '@/components/3d/GameScene'
import { GameUI } from '@/components/game/GameUI'

export default function GamePage() {
  return (
    <main className="w-screen h-screen overflow-hidden relative bg-black">
      <GameScene />
      <GameUI />
    </main>
  )
}
