'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/stores/gameStore'

export function GameLoop() {
	const initialized = useRef(false)

	useEffect(() => {
		if (!initialized.current) {
			initialized.current = true
			useGameStore.getState().initializeGame()
		}
	}, [])

	useFrame((_, delta) => {
		useGameStore.getState().tick(delta)
	})

	return null
}
