'use client'

import Link from 'next/link'
import { useState } from 'react'
import { GAME_CONFIG, MAP_DEFINITIONS } from '@/config'

type Difficulty = 'easy' | 'normal' | 'hard'
type MapOption = 'random' | string

type Faction = 'terran' | 'protoss'

const factionInfo: Record<
	Faction,
	{ name: string; description: string; color: string; borderColor: string; icon: string }
> = {
	terran: {
		name: 'Terran',
		description: 'Versatile and mobile',
		color: 'rgba(59, 130, 246, 0.15)',
		borderColor: 'rgba(96, 165, 250, 0.4)',
		icon: '\u2694',
	},
	protoss: {
		name: 'Protoss',
		description: 'Powerful shields and tech',
		color: 'rgba(234, 179, 8, 0.15)',
		borderColor: 'rgba(250, 204, 21, 0.4)',
		icon: '\uD83D\uDEE1',
	},
}

export default function Home() {
	const [selectedFaction, setSelectedFaction] = useState<Faction>('terran')
	const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal')
	const [selectedMap, setSelectedMap] = useState<MapOption>('random')

	return (
		<main
			style={{
				minHeight: '100vh',
				background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1117 40%, #0a0a1a 100%)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: 'system-ui, -apple-system, sans-serif',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{/* Subtle star-field background */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage:
						'radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.15) 0%, transparent 100%), ' +
						'radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 100%), ' +
						'radial-gradient(1px 1px at 50% 40%, rgba(255,255,255,0.12) 0%, transparent 100%), ' +
						'radial-gradient(1px 1px at 70% 10%, rgba(255,255,255,0.08) 0%, transparent 100%), ' +
						'radial-gradient(1px 1px at 90% 60%, rgba(255,255,255,0.1) 0%, transparent 100%), ' +
						'radial-gradient(1px 1px at 15% 90%, rgba(255,255,255,0.1) 0%, transparent 100%), ' +
						'radial-gradient(1px 1px at 80% 85%, rgba(255,255,255,0.08) 0%, transparent 100%)',
					pointerEvents: 'none',
				}}
			/>

			{/* Vignette overlay */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
					pointerEvents: 'none',
				}}
			/>

			{/* Content */}
			<div
				style={{
					position: 'relative',
					zIndex: 1,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '12px',
				}}
			>
				{/* Title */}
				<h1
					style={{
						fontSize: 'clamp(3rem, 8vw, 5rem)',
						fontWeight: 800,
						background: 'linear-gradient(135deg, #60a5fa 0%, #22d3ee 50%, #a78bfa 100%)',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						backgroundClip: 'text',
						margin: 0,
						letterSpacing: '-0.02em',
						lineHeight: 1.1,
						textAlign: 'center',
					}}
				>
					{GAME_CONFIG.branding.name}
				</h1>

				{/* Tagline */}
				<p
					style={{
						fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
						color: '#9ca3af',
						margin: 0,
						letterSpacing: '0.05em',
						textTransform: 'uppercase',
						textAlign: 'center',
					}}
				>
					{GAME_CONFIG.branding.tagline}
				</p>

				{/* Faction Selector */}
				<div
					style={{
						marginTop: '24px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '16px',
					}}
				>
					<p
						style={{
							color: '#d1d5db',
							fontSize: '1rem',
							margin: 0,
							letterSpacing: '0.04em',
							textTransform: 'uppercase',
						}}
					>
						Choose your faction:
					</p>

					<div style={{ display: 'flex', gap: '16px' }}>
						{(Object.keys(factionInfo) as Faction[]).map((faction) => {
							const info = factionInfo[faction]
							const isSelected = selectedFaction === faction
							return (
								<button
									key={faction}
									type="button"
									onClick={() => setSelectedFaction(faction)}
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										gap: '6px',
										padding: '20px 28px',
										background: isSelected ? info.color : 'rgba(255,255,255,0.03)',
										border: isSelected ? '2px solid #00ff88' : `1px solid ${info.borderColor}`,
										borderRadius: '10px',
										cursor: 'pointer',
										transition: 'all 0.15s ease',
										minWidth: '140px',
									}}
									onMouseEnter={(e) => {
										if (!isSelected) {
											e.currentTarget.style.background = info.color
											e.currentTarget.style.borderColor = info.borderColor
										}
									}}
									onMouseLeave={(e) => {
										if (!isSelected) {
											e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
											e.currentTarget.style.borderColor = info.borderColor
										}
									}}
								>
									<span style={{ fontSize: '1.5rem' }}>{info.icon}</span>
									<span
										style={{
											color: '#f3f4f6',
											fontWeight: 700,
											fontSize: '1rem',
											letterSpacing: '0.06em',
											textTransform: 'uppercase',
										}}
									>
										{info.name}
									</span>
									<span
										style={{
											color: '#9ca3af',
											fontSize: '0.8rem',
										}}
									>
										{info.description}
									</span>
								</button>
							)
						})}
					</div>
				</div>

				{/* Difficulty Selector */}
				<div
					style={{
						marginTop: '16px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '10px',
					}}
				>
					<p
						style={{
							color: '#d1d5db',
							fontSize: '0.85rem',
							margin: 0,
							letterSpacing: '0.04em',
							textTransform: 'uppercase',
						}}
					>
						Difficulty:
					</p>
					<div style={{ display: 'flex', gap: '8px' }}>
						{(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => {
							const isSelected = selectedDifficulty === diff
							const label = GAME_CONFIG.aiDifficulty[diff].label
							return (
								<button
									key={diff}
									type="button"
									onClick={() => setSelectedDifficulty(diff)}
									style={{
										padding: '8px 18px',
										background: isSelected
											? 'rgba(0, 255, 136, 0.1)'
											: 'rgba(255,255,255,0.03)',
										border: isSelected
											? '2px solid #00ff88'
											: '1px solid rgba(255,255,255,0.15)',
										borderRadius: '6px',
										color: isSelected ? '#00ff88' : '#d1d5db',
										fontWeight: isSelected ? 700 : 500,
										fontSize: '0.85rem',
										letterSpacing: '0.04em',
										textTransform: 'uppercase',
										cursor: 'pointer',
										transition: 'all 0.15s ease',
									}}
								>
									{label}
								</button>
							)
						})}
					</div>
				</div>

				{/* Map Selector */}
				<div
					style={{
						marginTop: '12px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '10px',
					}}
				>
					<p
						style={{
							color: '#d1d5db',
							fontSize: '0.85rem',
							margin: 0,
							letterSpacing: '0.04em',
							textTransform: 'uppercase',
						}}
					>
						Map:
					</p>
					<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
						{[{ id: 'random', name: 'Random' }, ...MAP_DEFINITIONS].map((map) => {
							const isSelected = selectedMap === map.id
							return (
								<button
									key={map.id}
									type="button"
									onClick={() => setSelectedMap(map.id)}
									style={{
										padding: '6px 14px',
										background: isSelected
											? 'rgba(0, 255, 136, 0.1)'
											: 'rgba(255,255,255,0.03)',
										border: isSelected
											? '2px solid #00ff88'
											: '1px solid rgba(255,255,255,0.15)',
										borderRadius: '6px',
										color: isSelected ? '#00ff88' : '#d1d5db',
										fontWeight: isSelected ? 700 : 500,
										fontSize: '0.8rem',
										letterSpacing: '0.03em',
										cursor: 'pointer',
										transition: 'all 0.15s ease',
									}}
								>
									{map.name}
								</button>
							)
						})}
					</div>
				</div>

				{/* Buttons */}
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '12px',
						marginTop: '24px',
						width: '260px',
					}}
				>
					<Link
						href={`/game?faction=${selectedFaction}&difficulty=${selectedDifficulty}&map=${selectedMap}`}
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '10px',
							padding: '16px 32px',
							background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)',
							color: '#ffffff',
							fontWeight: 700,
							fontSize: '1.1rem',
							borderRadius: '8px',
							border: '1px solid rgba(96,165,250,0.3)',
							textDecoration: 'none',
							letterSpacing: '0.05em',
							textTransform: 'uppercase',
							boxShadow: '0 0 24px rgba(37,99,235,0.3), 0 4px 12px rgba(0,0,0,0.4)',
							transition: 'transform 0.15s ease, box-shadow 0.15s ease',
							cursor: 'pointer',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = 'scale(1.04)'
							e.currentTarget.style.boxShadow =
								'0 0 32px rgba(37,99,235,0.5), 0 6px 16px rgba(0,0,0,0.4)'
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = 'scale(1)'
							e.currentTarget.style.boxShadow =
								'0 0 24px rgba(37,99,235,0.3), 0 4px 12px rgba(0,0,0,0.4)'
						}}
					>
						<span style={{ fontSize: '1.2rem' }}>&#9654;</span>
						New Game
					</Link>

					<button
						type="button"
						disabled
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '10px',
							padding: '16px 32px',
							background: 'rgba(255,255,255,0.05)',
							color: '#6b7280',
							fontWeight: 700,
							fontSize: '1.1rem',
							borderRadius: '8px',
							border: '1px solid rgba(255,255,255,0.08)',
							letterSpacing: '0.05em',
							textTransform: 'uppercase',
							cursor: 'not-allowed',
							opacity: 0.6,
						}}
					>
						<span style={{ fontSize: '1.1rem' }}>&#9881;</span>
						Settings
					</button>
				</div>

				{/* Footer */}
				<p
					style={{
						marginTop: '48px',
						fontSize: '0.8rem',
						color: '#4b5563',
						letterSpacing: '0.04em',
						textAlign: 'center',
					}}
				>
					Built with Three.js &bull; React &bull; TypeScript
				</p>
			</div>
		</main>
	)
}
