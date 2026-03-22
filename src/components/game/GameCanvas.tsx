'use client'

import { Canvas } from '@react-three/fiber'
import { BuildingPlacer } from './BuildingPlacer'
import { EntityRenderer } from './EntityRenderer'
import { GameCamera } from './GameCamera'
import { GameLoop } from './GameLoop'
import { InputHandler } from './InputHandler'
import { Terrain } from './Terrain'

export function GameCanvas() {
	return (
		<Canvas
			shadows
			gl={{ antialias: true, alpha: false }}
			style={{ width: '100vw', height: '100vh', background: '#0a0a0f' }}
		>
			<ambientLight intensity={0.5} color="#ffeedd" />
			<directionalLight
				position={[50, 80, 50]}
				intensity={1.4}
				color="#fff5e6"
				castShadow
				shadow-mapSize-width={2048}
				shadow-mapSize-height={2048}
				shadow-camera-far={200}
				shadow-camera-left={-100}
				shadow-camera-right={100}
				shadow-camera-top={100}
				shadow-camera-bottom={-100}
			/>
			<hemisphereLight args={['#c4e8ff', '#556655', 0.7]} />
			<fog attach="fog" args={['#0a0a0f', 90, 160]} />
			<GameLoop />
			<InputHandler />
			<GameCamera />
			<Terrain />
			<EntityRenderer />
			<BuildingPlacer />
		</Canvas>
	)
}
