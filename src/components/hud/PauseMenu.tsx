'use client'

import { useEffect, useRef } from 'react'
import { audioEngine } from '@/lib/audio'
import { useGameStore } from '@/stores/gameStore'

const SPEED_OPTIONS = [0.5, 1, 2] as const

export function PauseMenu() {
	const resumeRef = useRef<HTMLButtonElement>(null)
	const speed = useGameStore((s) => s.speed)

	useEffect(() => {
		resumeRef.current?.focus()
	}, [])

	const handleResume = () => {
		const state = useGameStore.getState()
		state.togglePauseMenu()
	}

	const handleQuit = () => {
		window.location.href = '/'
	}

	const handleSpeedChange = (newSpeed: number) => {
		useGameStore.setState({ speed: newSpeed })
	}

	const handleSoundToggle = (enabled: boolean) => {
		audioEngine.setEnabled(enabled)
	}

	const soundEnabled = audioEngine.isEnabled()

	return (
		<div
			role="dialog"
			aria-label="Pause menu"
			style={{
				position: 'fixed',
				inset: 0,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: 'rgba(0, 0, 0, 0.75)',
				zIndex: 100,
				pointerEvents: 'auto',
			}}
		>
			<h1
				style={{
					fontSize: '3rem',
					fontWeight: 'bold',
					color: '#ffffff',
					textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
					marginBottom: '2rem',
					fontFamily: 'sans-serif',
					letterSpacing: '0.15em',
				}}
			>
				PAUSED
			</h1>

			<button
				ref={resumeRef}
				type="button"
				aria-label="Resume game"
				onClick={handleResume}
				style={{
					padding: '16px 48px',
					fontSize: '1.5rem',
					fontWeight: 'bold',
					backgroundColor: '#22cc44',
					color: '#000',
					border: 'none',
					borderRadius: '8px',
					cursor: 'pointer',
					fontFamily: 'sans-serif',
					marginBottom: '2rem',
				}}
			>
				RESUME
			</button>

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '12px',
					marginBottom: '1.5rem',
					fontFamily: 'sans-serif',
					color: '#ccc',
					fontSize: '1.1rem',
				}}
			>
				<span>Game Speed:</span>
				{SPEED_OPTIONS.map((s) => (
					<button
						key={s}
						type="button"
						aria-label={`Set game speed to ${s}x`}
						onClick={() => handleSpeedChange(s)}
						style={{
							padding: '8px 16px',
							fontSize: '1rem',
							fontWeight: 'bold',
							backgroundColor: speed === s ? '#4488ff' : '#333',
							color: speed === s ? '#fff' : '#aaa',
							border: speed === s ? '2px solid #6699ff' : '2px solid #555',
							borderRadius: '6px',
							cursor: 'pointer',
							fontFamily: 'sans-serif',
						}}
					>
						{s}x
					</button>
				))}
			</div>

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '12px',
					marginBottom: '2rem',
					fontFamily: 'sans-serif',
					color: '#ccc',
					fontSize: '1.1rem',
				}}
			>
				<span>Sound:</span>
				<button
					type="button"
					aria-label="Turn sound on"
					onClick={() => handleSoundToggle(true)}
					style={{
						padding: '8px 16px',
						fontSize: '1rem',
						fontWeight: 'bold',
						backgroundColor: soundEnabled ? '#4488ff' : '#333',
						color: soundEnabled ? '#fff' : '#aaa',
						border: soundEnabled ? '2px solid #6699ff' : '2px solid #555',
						borderRadius: '6px',
						cursor: 'pointer',
						fontFamily: 'sans-serif',
					}}
				>
					ON
				</button>
				<button
					type="button"
					aria-label="Turn sound off"
					onClick={() => handleSoundToggle(false)}
					style={{
						padding: '8px 16px',
						fontSize: '1rem',
						fontWeight: 'bold',
						backgroundColor: !soundEnabled ? '#4488ff' : '#333',
						color: !soundEnabled ? '#fff' : '#aaa',
						border: !soundEnabled ? '2px solid #6699ff' : '2px solid #555',
						borderRadius: '6px',
						cursor: 'pointer',
						fontFamily: 'sans-serif',
					}}
				>
					OFF
				</button>
			</div>

			<button
				type="button"
				aria-label="Quit to main menu"
				onClick={handleQuit}
				style={{
					padding: '16px 48px',
					fontSize: '1.5rem',
					fontWeight: 'bold',
					backgroundColor: '#dd3333',
					color: '#000',
					border: 'none',
					borderRadius: '8px',
					cursor: 'pointer',
					fontFamily: 'sans-serif',
				}}
			>
				QUIT
			</button>
		</div>
	)
}
