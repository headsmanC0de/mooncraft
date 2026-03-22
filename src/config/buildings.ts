export interface BuildingDefinition {
	id: string
	name: string
	faction: 'terran' | 'protoss'
	cost: { minerals: number; gas: number }
	buildTime: number
	stats: { health: number; armor: number; sight: number }
	size: { width: number; height: number }
	produces: string[]
	supplyProvided: number
	requirements: string[]
	color: string
}

export const BUILDING_DEFINITIONS: Record<string, BuildingDefinition> = {
	command_center: {
		id: 'command_center',
		name: 'Command Center',
		faction: 'terran',
		cost: { minerals: 400, gas: 0 },
		buildTime: 60,
		stats: { health: 1500, armor: 1, sight: 10 },
		size: { width: 4, height: 3 },
		produces: ['worker'],
		supplyProvided: 10,
		requirements: [],
		color: '#667788',
	},
	barracks: {
		id: 'barracks',
		name: 'Barracks',
		faction: 'terran',
		cost: { minerals: 150, gas: 0 },
		buildTime: 40,
		stats: { health: 1000, armor: 1, sight: 9 },
		size: { width: 3, height: 3 },
		produces: ['marine'],
		supplyProvided: 0,
		requirements: ['command_center'],
		color: '#556677',
	},
	factory: {
		id: 'factory',
		name: 'Factory',
		faction: 'terran',
		cost: { minerals: 150, gas: 100 },
		buildTime: 45,
		stats: { health: 1250, armor: 1, sight: 9 },
		size: { width: 3, height: 3 },
		produces: ['siege_tank'],
		supplyProvided: 0,
		requirements: ['barracks'],
		color: '#445566',
	},
	supply_depot: {
		id: 'supply_depot',
		name: 'Supply Depot',
		faction: 'terran',
		cost: { minerals: 100, gas: 0 },
		buildTime: 20,
		stats: { health: 400, armor: 0, sight: 7 },
		size: { width: 2, height: 2 },
		produces: [],
		supplyProvided: 8,
		requirements: [],
		color: '#778899',
	},
	nexus: {
		id: 'nexus',
		name: 'Nexus',
		faction: 'protoss',
		cost: { minerals: 400, gas: 0 },
		buildTime: 60,
		stats: { health: 1000, armor: 1, sight: 11 },
		size: { width: 4, height: 3 },
		produces: ['probe'],
		supplyProvided: 10,
		requirements: [],
		color: '#ddaa44',
	},
	gateway: {
		id: 'gateway',
		name: 'Gateway',
		faction: 'protoss',
		cost: { minerals: 150, gas: 0 },
		buildTime: 40,
		stats: { health: 500, armor: 1, sight: 9 },
		size: { width: 3, height: 3 },
		produces: ['zealot', 'stalker'],
		supplyProvided: 0,
		requirements: ['nexus'],
		color: '#cc9933',
	},
	robotics_facility: {
		id: 'robotics_facility',
		name: 'Robotics Facility',
		faction: 'protoss',
		cost: { minerals: 200, gas: 100 },
		buildTime: 50,
		stats: { health: 450, armor: 1, sight: 9 },
		size: { width: 3, height: 3 },
		produces: ['colossus'],
		supplyProvided: 0,
		requirements: ['gateway'],
		color: '#bb8822',
	},
	pylon: {
		id: 'pylon',
		name: 'Pylon',
		faction: 'protoss',
		cost: { minerals: 100, gas: 0 },
		buildTime: 18,
		stats: { health: 200, armor: 0, sight: 9 },
		size: { width: 2, height: 2 },
		produces: [],
		supplyProvided: 8,
		requirements: [],
		color: '#eebb33',
	},
}

export function getBuildingDef(id: string): BuildingDefinition {
	const def = BUILDING_DEFINITIONS[id]
	if (!def) {
		throw new Error(`Unknown building definition: ${id}`)
	}
	return def
}
