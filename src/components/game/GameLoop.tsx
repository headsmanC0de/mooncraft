'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { checkGameStatus } from '@/lib/game/GameManager'
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
		const state = useGameStore.getState()
		if (state.gameStatus !== 'playing') return

		state.tick(delta)

		const status = checkGameStatus()
		if (status !== 'playing') {
			useGameStore.setState({ gameStatus: status })
		}
	})

	return null
}
