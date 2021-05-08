import {
	AllowNull,
	AutoIncrement,
	BelongsToMany,
	Column,
	CreatedAt,
	HasMany,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt,
} from 'sequelize-typescript';
import { AssPlayerReward } from './assPlayerReward';
import { Dinoz } from './dinoz';
import { DinozShop } from './dinozShop';
import { EpicReward } from './epicReward';
import { IngredientGrid } from './ingredientGrid';

@Table({ tableName: 'tb_player', timestamps: true })
export class Player extends Model {
	@PrimaryKey
	@AllowNull(false)
	@AutoIncrement
	@Column
	playerId!: number;

	@BelongsToMany(() => EpicReward, () => AssPlayerReward)
	reward!: Array<EpicReward>;

	@HasMany(() => Dinoz, 'playerId')
	dinoz!: Array<Dinoz>;

	@HasMany(() => IngredientGrid, 'playerId')
	ingredientGrid!: Array<IngredientGrid>;

	@HasMany(() => DinozShop, 'playerId')
	dinozShop!: Array<DinozShop>;

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
