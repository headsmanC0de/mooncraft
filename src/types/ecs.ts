/**
 * ECS Types - Core type definitions for Entity Component System
 * Following DRY, SSOT, KISS principles
 */

// Entity ID type
export type EntityId = string

// Component types enum
export enum ComponentType {
	TRANSFORM = 'transform',
	HEALTH = 'health',
	MOVEMENT = 'movement',
	COMBAT = 'combat',
	RESOURCE = 'resource',
	BUILDING = 'building',
	OWNER = 'owner',
	SELECTION = 'selection',
	ANIMATION = 'animation',
	RENDER = 'render',
	RESOURCE_CARRIER = 'resource_carrier',
}

// Vector types
export interface Vector2 {
	x: number
	y: number
}

export interface Vector3 {
	x: number
	y: number
	z: number
}

// Component interfaces
export interface TransformComponent {
	type: ComponentType.TRANSFORM
	position: Vector3
	rotation: number
	scale: Vector3
}

export interface HealthComponent {
	type: ComponentType.HEALTH
	current: number
	max: number
	armor: number
	shields?: number
}

export interface MovementComponent {
	type: ComponentType.MOVEMENT
	speed: number
	targetPosition: Vector3 | null
	path: Vector3[]
	isMoving: boolean
}

export interface CombatComponent {
	type: ComponentType.COMBAT
	attackDamage: number
	attackRange: number
	attackSpeed: number
	attackCooldown: number
	targetId: EntityId | null
}

export interface ResourceComponent {
	type: ComponentType.RESOURCE
	resourceType: 'mineral' | 'gas'
	amount: number
	maxCapacity: number
}

export interface OwnerComponent {
	type: ComponentType.OWNER
	playerId: string
	teamId: string
}

export interface BuildingComponent {
	type: ComponentType.BUILDING
	buildingType: string
	buildProgress: number
	queue: ProductionQueueItem[]
	rallyPoint: Vector3
}

export interface SelectionComponent {
	type: ComponentType.SELECTION
	isSelected: boolean
}

export interface AnimationComponent {
	type: ComponentType.ANIMATION
	currentAnimation: string
	animationTime: number
}

export interface RenderComponent {
	type: ComponentType.RENDER
	modelPath?: string
	color?: string
	visible: boolean
}

export interface ResourceCarrierComponent {
	type: ComponentType.RESOURCE_CARRIER
	state: 'idle' | 'moving_to_resource' | 'gathering' | 'returning'
	targetResourceId: EntityId | null
	returnBuildingId: EntityId | null
	currentLoad: number
	maxCapacity: number
	gatherRate: number
	gatherTimer: number
}

// Union type for all components
export type Component =
	| TransformComponent
	| HealthComponent
	| MovementComponent
	| CombatComponent
	| ResourceComponent
	| OwnerComponent
	| BuildingComponent
	| SelectionComponent
	| AnimationComponent
	| RenderComponent
	| ResourceCarrierComponent

// Production queue item
export interface ProductionQueueItem {
	type: string
	progress: number
	duration: number
}

// Entity interface
export interface Entity {
	id: EntityId
	components: Map<ComponentType, Component>
}

// Player action types
export type PlayerAction =
	| { type: 'select'; entityIds: EntityId[] }
	| { type: 'move'; targetPosition: Vector3 }
	| { type: 'attack'; targetId: EntityId }
	| { type: 'build'; buildingType: string; position: Vector3 }
	| { type: 'train'; unitType: string }
	| { type: 'gather'; resourceId: EntityId }

// Network message types
export interface SyncMessage {
	type: 'sync'
	tick: number
	timestamp: number
	entities: EntityState[]
}

export interface EntityState {
	id: EntityId
	components: Partial<ComponentSnapshot>
}

export interface ComponentSnapshot {
	transform?: TransformComponent
	health?: HealthComponent
	movement?: MovementComponent
	combat?: CombatComponent
	resource?: ResourceComponent
	owner?: OwnerComponent
	building?: BuildingComponent
	selection?: SelectionComponent
	animation?: AnimationComponent
	render?: RenderComponent
}

export interface InputMessage {
	type: 'input'
	tick: number
	playerId: string
	actions: PlayerAction[]
}

// Game state
export interface GameState {
	currentTick: number
	entities: Map<EntityId, Entity>
	players: Map<string, PlayerState>
	isPaused: boolean
	speed: number
}

export interface PlayerState {
	id: string
	name: string
	teamId: string
	resources: {
		minerals: number
		gas: number
		supply: number
		maxSupply: number
	}
	isAlive: boolean
}
