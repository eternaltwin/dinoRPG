import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName: 'tb_news', timestamps: true })
export class News extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	@Column(DataType.TEXT)
	title!: string;

	@Column(DataType.BLOB)
	image!: Buffer;

	@Column(DataType.TEXT)
	frenchTitle!: string;

	@Column(DataType.TEXT)
	frenchText!: string;

	@Column(DataType.TEXT)
	englishTitle!: string;

	@Column(DataType.TEXT)
	englishText!: string;

	@Column(DataType.TEXT)
	spanishTitle!: string;

	@Column(DataType.TEXT)
	spanishText!: string;

	@Column(DataType.TEXT)
	germanTitle!: string;

	@Column(DataType.TEXT)
	germanText!: string;
}
