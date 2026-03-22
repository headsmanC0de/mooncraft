export interface MapDefinition {
	id: string
	name: string
	width: number
	height: number
	player1: {
		base: { x: number; y: number; z: number }
		minerals: { x: number; y: number; z: number }[]
		gasGeyser: { x: number; y: number; z: number }
	}
	player2: {
		base: { x: number; y: number; z: number }
		minerals: { x: number; y: number; z: number }[]
		gasGeyser: { x: number; y: number; z: number }
	}
}

export const MAP_DEFINITIONS: MapDefinition[] = [
	{
		id: 'crossroads',
		name: 'Crossroads',
		width: 128,
		height: 128,
		player1: {
			base: { x: 20, y: 0, z: 20 },
			minerals: [
				{ x: 8, y: 0, z: 15 },
				{ x: 10, y: 0, z: 15 },
				{ x: 12, y: 0, z: 15 },
				{ x: 14, y: 0, z: 15 },
				{ x: 8, y: 0, z: 17 },
				{ x: 10, y: 0, z: 17 },
				{ x: 12, y: 0, z: 17 },
				{ x: 14, y: 0, z: 17 },
			],
			gasGeyser: { x: 25, y: 0, z: 12 },
		},
		player2: {
			base: { x: 108, y: 0, z: 108 },
			minerals: [
				{ x: 114, y: 0, z: 103 },
				{ x: 116, y: 0, z: 103 },
				{ x: 118, y: 0, z: 103 },
				{ x: 120, y: 0, z: 103 },
				{ x: 114, y: 0, z: 105 },
				{ x: 116, y: 0, z: 105 },
				{ x: 118, y: 0, z: 105 },
				{ x: 120, y: 0, z: 105 },
			],
			gasGeyser: { x: 113, y: 0, z: 100 },
		},
	},
	{
		id: 'mirror_lake',
		name: 'Mirror Lake',
		width: 128,
		height: 128,
		player1: {
			base: { x: 15, y: 0, z: 64 },
			minerals: [
				{ x: 5, y: 0, z: 58 },
				{ x: 7, y: 0, z: 58 },
				{ x: 9, y: 0, z: 58 },
				{ x: 11, y: 0, z: 58 },
				{ x: 5, y: 0, z: 60 },
				{ x: 7, y: 0, z: 60 },
				{ x: 9, y: 0, z: 60 },
				{ x: 11, y: 0, z: 60 },
			],
			gasGeyser: { x: 20, y: 0, z: 55 },
		},
		player2: {
			base: { x: 113, y: 0, z: 64 },
			minerals: [
				{ x: 117, y: 0, z: 58 },
				{ x: 119, y: 0, z: 58 },
				{ x: 121, y: 0, z: 58 },
				{ x: 123, y: 0, z: 58 },
				{ x: 117, y: 0, z: 60 },
				{ x: 119, y: 0, z: 60 },
				{ x: 121, y: 0, z: 60 },
				{ x: 123, y: 0, z: 60 },
			],
			gasGeyser: { x: 108, y: 0, z: 55 },
		},
	},
	{
		id: 'fortress',
		name: 'Fortress',
		width: 96,
		height: 96,
		player1: {
			base: { x: 15, y: 0, z: 15 },
			minerals: [
				{ x: 5, y: 0, z: 10 },
				{ x: 7, y: 0, z: 10 },
				{ x: 9, y: 0, z: 10 },
				{ x: 11, y: 0, z: 10 },
				{ x: 5, y: 0, z: 12 },
				{ x: 7, y: 0, z: 12 },
				{ x: 9, y: 0, z: 12 },
				{ x: 11, y: 0, z: 12 },
			],
			gasGeyser: { x: 20, y: 0, z: 8 },
		},
		player2: {
			base: { x: 81, y: 0, z: 81 },
			minerals: [
				{ x: 85, y: 0, z: 76 },
				{ x: 87, y: 0, z: 76 },
				{ x: 89, y: 0, z: 76 },
				{ x: 91, y: 0, z: 76 },
				{ x: 85, y: 0, z: 78 },
				{ x: 87, y: 0, z: 78 },
				{ x: 89, y: 0, z: 78 },
				{ x: 91, y: 0, z: 78 },
			],
			gasGeyser: { x: 76, y: 0, z: 73 },
		},
	},
]

export function getRandomMap(): MapDefinition {
	return MAP_DEFINITIONS[Math.floor(Math.random() * MAP_DEFINITIONS.length)]
}

export function getMapById(id: string): MapDefinition {
	const map = MAP_DEFINITIONS.find((m) => m.id === id)
	if (!map) throw new Error(`Unknown map: ${id}`)
	return map
}
