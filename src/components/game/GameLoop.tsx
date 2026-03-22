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

	useEffect(() => {
		const resumeAudio = () => {
			import('@/lib/audio').then((m) => m.audioEngine.playClick())
			document.removeEventListener('click', resumeAudio)
			document.removeEventListener('keydown', resumeAudio)
		}
		document.addEventListener('click', resumeAudio, { once: true })
		document.addEventListener('keydown', resumeAudio, { once: true })
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
