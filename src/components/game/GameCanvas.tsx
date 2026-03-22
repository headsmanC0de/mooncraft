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
			style={{ width: '100vw', height: '100vh', background: '#121218' }}
		>
			<ambientLight intensity={1.2} color="#ffeedd" />
			<directionalLight
				position={[50, 80, 50]}
				intensity={2.5}
				color="#fff8ee"
				castShadow
				shadow-mapSize-width={2048}
				shadow-mapSize-height={2048}
				shadow-camera-far={200}
				shadow-camera-left={-100}
				shadow-camera-right={100}
				shadow-camera-top={100}
				shadow-camera-bottom={-100}
			/>
			<hemisphereLight args={['#d4f0ff', '#556655', 0.8]} />
			<fog attach="fog" args={['#121218', 200, 400]} />
			<GameLoop />
			<InputHandler />
			<GameCamera />
			<Terrain />
			<EntityRenderer />
			<BuildingPlacer />
		</Canvas>
	)
}
