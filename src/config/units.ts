export interface UnitDefinition {
	id: string
	name: string
	faction: 'terran' | 'protoss'
	cost: { minerals: number; gas: number; supply: number }
	buildTime: number
	stats: {
		health: number
		armor: number
		speed: number
		sight: number
		shields?: number
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
		faction: 'terran',
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
		faction: 'terran',
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
		faction: 'terran',
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
		faction: 'terran',
		cost: { minerals: 100, gas: 100, supply: 2 },
		buildTime: 30,
		stats: { health: 150, armor: 1, speed: 4.25, sight: 11 },
		canGather: false,
		isFlying: true,
		modelScale: 1.2,
		color: '#aaccee',
	},
	probe: {
		id: 'probe',
		name: 'Probe',
		faction: 'protoss',
		cost: { minerals: 50, gas: 0, supply: 1 },
		buildTime: 12,
		stats: { health: 20, armor: 0, speed: 3.5, sight: 8, shields: 20 },
		combat: {
			damage: 5,
			range: 1,
			attackSpeed: 1.5,
			targetsAir: false,
			targetsGround: true,
		},
		canGather: true,
		isFlying: false,
		modelScale: 0.8,
		color: '#ddaa44',
	},
	zealot: {
		id: 'zealot',
		name: 'Zealot',
		faction: 'protoss',
		cost: { minerals: 100, gas: 0, supply: 2 },
		buildTime: 27,
		stats: { health: 100, armor: 1, speed: 3.15, sight: 9, shields: 50 },
		combat: {
			damage: 8,
			range: 1,
			attackSpeed: 0.86,
			targetsAir: false,
			targetsGround: true,
		},
		canGather: false,
		isFlying: false,
		modelScale: 1.0,
		color: '#cc9933',
	},
	stalker: {
		id: 'stalker',
		name: 'Stalker',
		faction: 'protoss',
		cost: { minerals: 125, gas: 50, supply: 2 },
		buildTime: 30,
		stats: { health: 80, armor: 1, speed: 4.13, sight: 10, shields: 80 },
		combat: {
			damage: 10,
			range: 6,
			attackSpeed: 1.44,
			targetsAir: true,
			targetsGround: true,
		},
		canGather: false,
		isFlying: false,
		modelScale: 1.1,
		color: '#bb8822',
	},
	colossus: {
		id: 'colossus',
		name: 'Colossus',
		faction: 'protoss',
		cost: { minerals: 300, gas: 200, supply: 6 },
		buildTime: 54,
		stats: { health: 200, armor: 1, speed: 2.95, sight: 12, shields: 150 },
		combat: {
			damage: 20,
			range: 7,
			attackSpeed: 1.65,
			targetsAir: false,
			targetsGround: true,
		},
		canGather: false,
		isFlying: false,
		modelScale: 1.5,
		color: '#eebb33',
	},
}

export function getUnitDef(id: string): UnitDefinition {
	const def = UNIT_DEFINITIONS[id]
	if (!def) {
		throw new Error(`Unknown unit definition: ${id}`)
	}
	return def
}
