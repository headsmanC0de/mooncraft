import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-400 via-cyan-500 to-purple-500 bg-clip-text text-transparent">
            MoonCraft
          </h1>
          <p className="text-gray-400 text-xl max-w-md mx-auto">
            Online RTS game inspired by StarCraft & WarCraft
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/game"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg rounded-lg shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
          >
            🎮 Play Game
          </Link>
          <Link 
            href="/docs"
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg rounded-lg border border-gray-600 transition-all"
          >
            📚 Documentation
          </Link>
        </div>
        
        <div className="pt-8 border-t border-white/10 max-w-2xl mx-auto">
          <h2 className="text-white font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <FeatureCard icon="🎯" title="ECS Architecture" desc="Entity Component System" />
            <FeatureCard icon="🌐" title="Multiplayer" desc="Real-time WebSocket sync" />
            <FeatureCard icon="🎮" title="RTS Gameplay" desc="Units, buildings, resources" />
          </div>
        </div>
        
        <div className="text-sm text-gray-500 flex gap-4 justify-center">
          <span>Three.js</span>
          <span>•</span>
          <span>React Three Fiber</span>
          <span>•</span>
          <span>TypeScript</span>
          <span>•</span>
          <span>Zustand</span>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-white font-bold text-sm">{title}</div>
      <div className="text-gray-400 text-xs">{desc}</div>
    </div>
  )
}
