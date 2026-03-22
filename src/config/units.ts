export interface UnitDefinition {
	id: string
	name: string
	cost: { minerals: number; gas: number; supply: number }
	buildTime: number
	stats: {
		health: number
		armor: number
		speed: number
		sight: number
	}
	combat?: {
		damage: number
		range: number
		attackSpeed: number
		targetsAir: boolean
		targetsGround: boolean
	}
	canGather: boolean
	isFlying: boolean
	modelScale: number
	color: string
}

export const UNIT_DEFINITIONS: Record<string, UnitDefinition> = {
	worker: {
		id: 'worker',
		name: 'Worker',
		cost: { minerals: 50, gas: 0, supply: 1 },
		buildTime: 12,
		stats: { health: 45, armor: 0, speed: 3.5, sight: 8 },
		combat: {
			damage: 5,
			range: 1,
			attackSpeed: 1.5,
			targetsAir: false,
			targetsGround: true,
		},
		canGather: true,
		isFlying: false,
		modelScale: 1,
		color: '#88aacc',
	},
	marine: {
		id: 'marine',
		name: 'Marine',
		cost: { minerals: 50, gas: 0, supply: 1 },
		buildTime: 18,
		stats: { health: 40, armor: 0, speed: 4.13, sight: 9 },
		combat: {
			damage: 6,
			range: 4,
			attackSpeed: 0.86,
			targetsAir: true,
			targetsGround: true,
		},
		canGather: false,
		isFlying: false,
		modelScale: 1,
		color: '#5577cc',
	},
	siege_tank: {
		id: 'siege_tank',
		name: 'Siege Tank',
		cost: { minerals: 150, gas: 125, supply: 3 },
		buildTime: 32,
		stats: { health: 160, armor: 1, speed: 3.15, sight: 10 },
		combat: {
			damage: 15,
			range: 7,
			attackSpeed: 2.0,
			targetsAir: false,
			targetsGround: true,
		},
		canGather: false,
		isFlying: false,
		modelScale: 1.5,
		color: '#446699',
	},
	medivac: {
		id: 'medivac',
		name: 'Medivac',
		cost: { minerals: 100, gas: 100, supply: 2 },
		buildTime: 30,
		stats: { health: 150, armor: 1, speed: 4.25, sight: 11 },
		canGather: false,
		isFlying: true,
		modelScale: 1.2,
		color: '#aaccee',
	},
}

export function getUnitDef(id: string): UnitDefinition {
	const def = UNIT_DEFINITIONS[id]
	if (!def) {
		throw new Error(`Unknown unit definition: ${id}`)
	}
	return def
}
