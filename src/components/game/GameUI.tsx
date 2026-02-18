'use client'

import { useGameStore } from '@/stores/gameStore'

export function GameUI() {
  const { 
    players, isPaused, pause, resume,
    selectedUnits, placementMode, setPlacementMode
  } = useGameStore()
  
  // Get player resources (simplified - assuming player1 is local player)
  const playerResources = players.get('player1')?.resources
  
  return (
    <div className="fixed inset-0 pointer-events-none select-none">
      {/* Top bar - Resources */}
      <div className="absolute top-0 left-0 right-0 pointer-events-auto">
        <div className="bg-black/80 backdrop-blur-sm border-b border-cyan-500/30 px-4 py-2">
          <div className="flex items-center gap-8 text-white text-sm">
            <ResourceDisplay 
              icon="💎" 
              label="Minerals" 
              value={playerResources?.minerals || 0} 
              color="cyan"
            />
            <ResourceDisplay 
              icon="⛽" 
              label="Gas" 
              value={playerResources?.gas || 0} 
              color="green"
            />
            <ResourceDisplay 
              icon="📦" 
              label="Supply" 
              value={`${playerResources?.supply || 0}/${playerResources?.maxSupply || 0}`} 
              color="yellow"
            />
            
            <div className="ml-auto flex gap-2">
              {isPaused ? (
                <button 
                  onClick={resume}
                  className="px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded font-bold text-xs"
                >
                  ▶ Resume
                </button>
              ) : (
                <button 
                  onClick={pause}
                  className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 rounded font-bold text-xs"
                >
                  ⏸ Pause
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Controls help */}
      <div className="absolute top-16 right-4 pointer-events-auto">
        <div className="bg-black/60 border border-white/10 rounded-lg p-3 text-xs text-gray-400 space-y-1">
          <p><span className="text-cyan-400 font-bold">WASD</span> - Move camera</p>
          <p><span className="text-cyan-400 font-bold">Space</span> - Pause/Resume</p>
        </div>
      </div>
      
      {/* Selected units info */}
      {selectedUnits.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/90 border border-cyan-500/30 rounded-lg p-4 min-w-[300px]">
            <h3 className="text-cyan-400 font-bold">
              {selectedUnits.length} unit{selectedUnits.length > 1 ? 's' : ''} selected
            </h3>
          </div>
        </div>
      )}
    </div>
  )
}

function ResourceDisplay({ icon, label, value, color }: { 
  icon: string; label: string; value: string | number; color: string 
}) {
  const colors = {
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 uppercase">{label}</span>
        <span className={`font-mono font-bold ${colors[color as keyof typeof colors]}`}>
          {typeof value === 'number' ? Math.floor(value) : value}
        </span>
      </div>
    </div>
  )
}
