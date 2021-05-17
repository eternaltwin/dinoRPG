import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';
import { Status } from './status.js';

@Table({ tableName: 'tb_ass_dinoz_status', timestamps: false })
export class AssDinozStatus extends Model {
	@ForeignKey(() => Dinoz)
	@Column
	dinozId!: number;

	@ForeignKey(() => Status)
	@Column
	statusId!: number;
}
