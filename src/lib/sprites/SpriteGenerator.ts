const SPRITE_SIZE = 128

export function generateUnitSprite(
	unitType: string,
	teamColor: string,
): HTMLCanvasElement {
	const canvas = document.createElement('canvas')
	canvas.width = SPRITE_SIZE
	canvas.height = SPRITE_SIZE
	const ctx = canvas.getContext('2d')!
	const cx = SPRITE_SIZE / 2
	const cy = SPRITE_SIZE / 2

	ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)

	switch (unitType) {
		case 'worker':
		case 'probe':
			drawWorkerSprite(ctx, cx, cy, teamColor)
			break
		case 'marine':
			drawMarineSprite(ctx, cx, cy, teamColor)
			break
		case 'zealot':
			drawZealotSprite(ctx, cx, cy, teamColor)
			break
		case 'stalker':
			drawStalkerSprite(ctx, cx, cy, teamColor)
			break
		case 'siege_tank':
			drawTankSprite(ctx, cx, cy, teamColor)
			break
		case 'medivac':
			drawMedivacSprite(ctx, cx, cy, teamColor)
			break
		case 'colossus':
			drawColossusSprite(ctx, cx, cy, teamColor)
			break
	}

	return canvas
}

function drawWorkerSprite(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	color: string,
) {
	// Body circle
	ctx.fillStyle = color
	ctx.beginPath()
	ctx.arc(cx, cy + 5, 22, 0, Math.PI * 2)
	ctx.fill()
	ctx.strokeStyle = lighten(color)
	ctx.lineWidth = 2
	ctx.stroke()

	// Head (smaller circle)
	ctx.fillStyle = lighten(color)
	ctx.beginPath()
	ctx.arc(cx, cy - 18, 12, 0, Math.PI * 2)
	ctx.fill()

	// Mining tool (pickaxe shape)
	ctx.strokeStyle = '#cccccc'
	ctx.lineWidth = 3
	ctx.beginPath()
	ctx.moveTo(cx + 15, cy - 5)
	ctx.lineTo(cx + 30, cy - 25)
	ctx.stroke()
	ctx.beginPath()
	ctx.moveTo(cx + 25, cy - 28)
	ctx.lineTo(cx + 35, cy - 22)
	ctx.stroke()
}

function drawMarineSprite(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	color: string,
) {
	// Body (wider, armored look)
	ctx.fillStyle = color
	ctx.fillRect(cx - 18, cy - 5, 36, 35)
	ctx.strokeStyle = lighten(color)
	ctx.lineWidth = 2
	ctx.strokeRect(cx - 18, cy - 5, 36, 35)

	// Helmet/head
	ctx.fillStyle = darken(color)
	ctx.beginPath()
	ctx.arc(cx, cy - 15, 14, 0, Math.PI * 2)
	ctx.fill()

	// Visor
	ctx.fillStyle = '#66bbff'
	ctx.fillRect(cx - 8, cy - 18, 16, 6)

	// Rifle
	ctx.fillStyle = '#666666'
	ctx.fillRect(cx + 18, cy - 10, 25, 5)
	ctx.fillStyle = '#888888'
	ctx.fillRect(cx + 38, cy - 12, 6, 9)
}

function drawZealotSprite(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	color: string,
) {
	// Body
	ctx.fillStyle = color
	ctx.beginPath()
	ctx.moveTo(cx, cy - 30)
	ctx.lineTo(cx + 20, cy + 5)
	ctx.lineTo(cx + 15, cy + 30)
	ctx.lineTo(cx - 15, cy + 30)
	ctx.lineTo(cx - 20, cy + 5)
	ctx.closePath()
	ctx.fill()
	ctx.strokeStyle = lighten(color)
	ctx.lineWidth = 2
	ctx.stroke()

	// Energy blades (both sides)
	ctx.fillStyle = '#44ddff'
	ctx.shadowColor = '#44ddff'
	ctx.shadowBlur = 10
	ctx.fillRect(cx - 35, cy - 10, 15, 4)
	ctx.fillRect(cx + 20, cy - 10, 15, 4)
	ctx.shadowBlur = 0

	// Glowing eyes
	ctx.fillStyle = '#44ddff'
	ctx.beginPath()
	ctx.arc(cx - 5, cy - 20, 3, 0, Math.PI * 2)
	ctx.arc(cx + 5, cy - 20, 3, 0, Math.PI * 2)
	ctx.fill()
}

function drawStalkerSprite(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	color: string,
) {
	// Body (narrow, tall)
	ctx.fillStyle = color
	ctx.fillRect(cx - 12, cy - 25, 24, 30)
	ctx.strokeStyle = lighten(color)
	ctx.lineWidth = 2
	ctx.strokeRect(cx - 12, cy - 25, 24, 30)

	// Legs (mechanical, spread)
	ctx.strokeStyle = darken(color)
	ctx.lineWidth = 4
	ctx.beginPath()
	ctx.moveTo(cx - 8, cy + 5)
	ctx.lineTo(cx - 18, cy + 30)
	ctx.moveTo(cx + 8, cy + 5)
	ctx.lineTo(cx + 18, cy + 30)
	ctx.stroke()

	// Weapon
	ctx.fillStyle = '#44ddff'
	ctx.shadowColor = '#44ddff'
	ctx.shadowBlur = 8
	ctx.fillRect(cx + 12, cy - 20, 20, 4)
	ctx.shadowBlur = 0

	// Eye
	ctx.fillStyle = '#44ddff'
	ctx.beginPath()
	ctx.arc(cx, cy - 18, 4, 0, Math.PI * 2)
	ctx.fill()
}

function drawTankSprite(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	color: string,
) {
	// Treads
	ctx.fillStyle = darken(color)
	ctx.fillRect(cx - 28, cy + 5, 56, 20)

	// Hull
	ctx.fillStyle = color
	ctx.fillRect(cx - 22, cy - 8, 44, 18)
	ctx.strokeStyle = lighten(color)
	ctx.lineWidth = 2
	ctx.strokeRect(cx - 22, cy - 8, 44, 18)

	// Turret
	ctx.fillStyle = lighten(color)
	ctx.beginPath()
	ctx.arc(cx, cy - 5, 12, 0, Math.PI * 2)
	ctx.fill()

	// Barrel
	ctx.fillStyle = '#888888'
	ctx.fillRect(cx + 10, cy - 8, 35, 6)
}

function drawMedivacSprite(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	color: string,
) {
	// Body (oval)
	ctx.fillStyle = color
	ctx.beginPath()
	ctx.ellipse(cx, cy, 28, 16, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.strokeStyle = lighten(color)
	ctx.lineWidth = 2
	ctx.stroke()

	// Engines (circles on sides)
	ctx.fillStyle = '#44aaff'
	ctx.shadowColor = '#44aaff'
	ctx.shadowBlur = 8
	ctx.beginPath()
	ctx.arc(cx - 22, cy + 8, 6, 0, Math.PI * 2)
	ctx.arc(cx + 22, cy + 8, 6, 0, Math.PI * 2)
	ctx.fill()
	ctx.shadowBlur = 0

	// Cockpit window
	ctx.fillStyle = '#66bbff'
	ctx.beginPath()
	ctx.ellipse(cx, cy - 4, 10, 6, 0, 0, Math.PI * 2)
	ctx.fill()

	// Red cross (medic)
	ctx.fillStyle = '#ff4444'
	ctx.fillRect(cx - 2, cy + 4, 4, 10)
	ctx.fillRect(cx - 5, cy + 7, 10, 4)
}

function drawColossusSprite(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	color: string,
) {
	// Long legs
	ctx.strokeStyle = darken(color)
	ctx.lineWidth = 4
	ctx.beginPath()
	ctx.moveTo(cx - 15, cy - 5)
	ctx.lineTo(cx - 25, cy + 35)
	ctx.moveTo(cx + 15, cy - 5)
	ctx.lineTo(cx + 25, cy + 35)
	ctx.stroke()

	// Body (high up)
	ctx.fillStyle = color
	ctx.fillRect(cx - 18, cy - 35, 36, 32)
	ctx.strokeStyle = lighten(color)
	ctx.lineWidth = 2
	ctx.strokeRect(cx - 18, cy - 35, 36, 32)

	// Thermal lance beams (both sides)
	ctx.fillStyle = '#ff6644'
	ctx.shadowColor = '#ff6644'
	ctx.shadowBlur = 12
	ctx.fillRect(cx - 40, cy - 28, 22, 3)
	ctx.fillRect(cx + 18, cy - 28, 22, 3)
	ctx.shadowBlur = 0

	// Eye
	ctx.fillStyle = '#ff4444'
	ctx.beginPath()
	ctx.arc(cx, cy - 25, 5, 0, Math.PI * 2)
	ctx.fill()
}

function lighten(hex: string): string {
	const r = parseInt(hex.slice(1, 3), 16)
	const g = parseInt(hex.slice(3, 5), 16)
	const b = parseInt(hex.slice(5, 7), 16)
	return (
		'#' +
		[r, g, b]
			.map((c) => Math.min(255, c + 50).toString(16).padStart(2, '0'))
			.join('')
	)
}

function darken(hex: string): string {
	const r = parseInt(hex.slice(1, 3), 16)
	const g = parseInt(hex.slice(3, 5), 16)
	const b = parseInt(hex.slice(5, 7), 16)
	return (
		'#' +
		[r, g, b]
			.map((c) => Math.max(0, c - 40).toString(16).padStart(2, '0'))
			.join('')
	)
}

export function generateBuildingSprite(
	buildingType: string,
	teamColor: string,
): HTMLCanvasElement {
	const canvas = document.createElement('canvas')
	canvas.width = SPRITE_SIZE
	canvas.height = SPRITE_SIZE
	const ctx = canvas.getContext('2d')!
	const cx = SPRITE_SIZE / 2
	const cy = SPRITE_SIZE / 2

	ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)

	const bw = 50
	const bh = 45

	// Foundation
	ctx.fillStyle = darken(teamColor)
	ctx.fillRect(cx - bw / 2 - 2, cy - bh / 2 - 2, bw + 4, bh + 4)

	// Main structure
	ctx.fillStyle = teamColor
	ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh)
	ctx.strokeStyle = lighten(teamColor)
	ctx.lineWidth = 2
	ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh)

	// Windows (glowing)
	ctx.fillStyle = '#ffeeaa'
	ctx.shadowColor = '#ffeeaa'
	ctx.shadowBlur = 5
	for (let i = 0; i < 3; i++) {
		ctx.fillRect(cx - 16 + i * 14, cy - 8, 8, 8)
	}
	ctx.shadowBlur = 0

	// Roof
	ctx.fillStyle = lighten(teamColor)
	ctx.beginPath()
	ctx.moveTo(cx - bw / 2 - 5, cy - bh / 2)
	ctx.lineTo(cx, cy - bh / 2 - 15)
	ctx.lineTo(cx + bw / 2 + 5, cy - bh / 2)
	ctx.closePath()
	ctx.fill()

	// Building type icon
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold 12px monospace'
	ctx.textAlign = 'center'
	const label = buildingType
		.split('_')
		.map((w) => w[0].toUpperCase())
		.join('')
	ctx.fillText(label, cx, cy + bh / 2 - 5)

	return canvas
}
