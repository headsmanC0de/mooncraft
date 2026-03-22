'use client'

import { Canvas } from '@react-three/fiber'
import { Terrain } from './Terrain'
import { GameCamera } from './GameCamera'

export function GameCanvas() {
	return (
		<Canvas
			shadows
			gl={{ antialias: true, alpha: false }}
			style={{ width: '100vw', height: '100vh', background: '#0a0a0f' }}
		>
			<ambientLight intensity={0.4} />
			<directionalLight
				position={[50, 80, 50]}
				intensity={1.2}
				castShadow
				shadow-mapSize-width={2048}
				shadow-mapSize-height={2048}
				shadow-camera-far={200}
				shadow-camera-left={-100}
				shadow-camera-right={100}
				shadow-camera-top={100}
				shadow-camera-bottom={-100}
			/>
			<hemisphereLight args={['#b1e1ff', '#444444', 0.6]} />
			<fog attach="fog" args={['#0a0a0f', 80, 150]} />
			<GameCamera />
			<Terrain />
		</Canvas>
	)
}
