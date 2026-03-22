export interface BuildingDefinition {
	id: string
	name: string
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
		cost: { minerals: 100, gas: 0 },
		buildTime: 20,
		stats: { health: 400, armor: 0, sight: 7 },
		size: { width: 2, height: 2 },
		produces: [],
		supplyProvided: 8,
		requirements: [],
		color: '#778899',
	},
}

export function getBuildingDef(id: string): BuildingDefinition {
	const def = BUILDING_DEFINITIONS[id]
	if (!def) {
		throw new Error(`Unknown building definition: ${id}`)
	}
	return def
}
