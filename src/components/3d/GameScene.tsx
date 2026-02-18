'use client'

import { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'

function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const gridTexture = useMemo(() => {
    const size = 1024
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    
    // Dark ground base
    ctx.fillStyle = '#1a2a1a'
    ctx.fillRect(0, 0, size, size)
    
    // Grid lines
    ctx.strokeStyle = 'rgba(100, 150, 100, 0.2)'
    ctx.lineWidth = 2
    
    const gridSize = size / 64
    for (let i = 0; i <= 64; i++) {
      const pos = i * gridSize
      ctx.beginPath()
      ctx.moveTo(pos, 0)
      ctx.lineTo(pos, size)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(0, pos)
      ctx.lineTo(size, pos)
      ctx.stroke()
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(5, 5)
    
    return texture
  }, [])
  
  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[80, 0, 80]}
      receiveShadow
    >
      <planeGeometry args={[160, 160]} />
      <meshStandardMaterial 
        map={gridTexture}
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  )
}

function RTSCamera() {
  const { camera } = useThree()
  const { cameraPosition } = useGameStore()
  
  useEffect(() => {
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
    camera.lookAt(cameraPosition.x, 0, cameraPosition.z)
  }, [camera, cameraPosition])
  
  // Keyboard controls
  useEffect(() => {
    const keys = new Set<string>()
    
    const handleKeyDown = (e: KeyboardEvent) => keys.add(e.key.toLowerCase())
    const handleKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase())
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    const moveSpeed = 0.8
    
    const interval = setInterval(() => {
      if (keys.has('w') || keys.has('arrowup')) camera.position.z -= moveSpeed
      if (keys.has('s') || keys.has('arrowdown')) camera.position.z += moveSpeed
      if (keys.has('a') || keys.has('arrowleft')) camera.position.x -= moveSpeed
      if (keys.has('d') || keys.has('arrowright')) camera.position.x += moveSpeed
    }, 16)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      clearInterval(interval)
    }
  }, [camera])
  
  return (
    <OrbitControls
      enableRotate={false}
      enablePan={true}
      panSpeed={1}
      minDistance={20}
      maxDistance={100}
      maxPolarAngle={Math.PI / 3}
    />
  )
}

function GameLoop() {
  const tick = useGameStore(state => state.tick)
  
  useFrame((_, delta) => {
    tick(delta)
  })
  
  return null
}

function GameWorld() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[60, 100, 40]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={250}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      {/* Environment */}
      <Stars radius={400} depth={100} count={3000} factor={5} fade speed={0.5} />
      <fog attach="fog" args={['#0a0a1f', 100, 300]} />
      
      {/* Game elements */}
      <Terrain />
      <RTSCamera />
      <GameLoop />
    </>
  )
}

export function GameScene() {
  const initializeGame = useGameStore(state => state.initializeGame)
  
  useEffect(() => {
    initializeGame()
  }, [initializeGame])
  
  return (
    <Canvas
      shadows
      camera={{ position: [40, 50, 40], fov: 45, near: 0.1, far: 1000 }}
      style={{ background: 'linear-gradient(to bottom, #0a0a1f, #0a0a0f)' }}
    >
      <GameWorld />
    </Canvas>
  )
}
