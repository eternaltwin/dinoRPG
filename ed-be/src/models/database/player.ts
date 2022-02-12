import {
	AllowNull,
	AutoIncrement,
	Column,
	CreatedAt,
	DataType,
	HasMany,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt
} from 'sequelize-typescript';
import { ItemOwn } from './itemOwn.js';
import { AssPlayerReward } from './assPlayerReward.js';
import { Dinoz } from './dinoz.js';
import { DinozShop } from './dinozShop.js';
import { IngredientOwn } from './ingredientOwn.js';
import { Quest } from './quest.js';

@Table({ tableName: 'tb_player', timestamps: true })
export class Player extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column
	playerId!: number;

	@AllowNull(false)
	@Column
	hasImported!: boolean;

	@HasMany(() => AssPlayerReward, 'playerId')
	reward!: Array<AssPlayerReward>;

	@HasMany(() => Dinoz, { onDelete: 'CASCADE' })
	dinoz!: Array<Dinoz>;

	@HasMany(() => DinozShop, 'playerId')
	dinozShop!: Array<DinozShop>;

	@HasMany(() => ItemOwn, 'playerId')
	itemOwn!: Array<ItemOwn>;

	@HasMany(() => IngredientOwn, 'playerId')
	ingredientOwn!: Array<IngredientOwn>;

	@HasMany(() => Quest, 'playerId')
	quest!: Array<Quest>;

	@Column(DataType.TEXT)
	customText!: string;

	@AllowNull(false)
	@Column
	name!: string;

	@AllowNull(false)
	@Column
	eternalTwinId!: string;

	@AllowNull(false)
	@Column
	money!: number;

	@AllowNull(false)
	@Column
	quetzuBought!: number;

	@AllowNull(false)
	@Column
	leader!: boolean;

	@AllowNull(false)
	@Column
	engineer!: boolean;

	@AllowNull(false)
	@Column
	cooker!: boolean;

	@AllowNull(false)
	@Column
	shopKeeper!: boolean;

	@AllowNull(false)
	@Column
	merchant!: boolean;

	@AllowNull(false)
	@Column
	priest!: boolean;

	@AllowNull(false)
	@Column
	teacher!: boolean;

	@CreatedAt
	@Column
	createdAt!: Date;

	@UpdatedAt
	@Column
	updatedAt!: Date;
}
