export const GAME_CONFIG = {
	branding: { name: 'MoonCraft', tagline: 'Online RTS game' },
	startingResources: { minerals: 500, gas: 0, supply: 0, maxSupply: 10 },
	map: { width: 128, height: 128, tileSize: 1 },
	mineralPatch: { amount: 1500, gatherRate: 5, gatherInterval: 2 },
	camera: {
		initialPosition: { x: 40, y: 50, z: 40 },
		initialZoom: 30,
		minZoom: 15,
		maxZoom: 80,
		panSpeed: 40,
		edgeScrollThreshold: 30,
	},
	tickRate: 60,
} as const
