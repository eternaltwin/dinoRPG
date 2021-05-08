import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Dinoz } from './dinoz';
import { Status } from './status';

@Table({ tableName: 'tb_ass_dinoz_status', timestamps: false })
export class AssDinozStatus extends Model {
	@ForeignKey(() => Dinoz)
	@Column
	dinozId!: number;

	@ForeignKey(() => Status)
	@Column
	statusId!: number;
}
