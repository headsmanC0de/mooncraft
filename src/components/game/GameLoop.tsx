'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/stores/gameStore'
import { checkGameStatus } from '@/lib/game/GameManager'

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
