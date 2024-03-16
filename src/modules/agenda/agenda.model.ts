import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';
import BaseRepo from '../../abstracts/repo.abstract';

@modelOptions({ schemaOptions: { timestamps: true } })
class Agenda extends BaseRepo<Agenda> {
  @prop({ required: true })
    originId!: number;

  @prop({ required: true })
    name!: string;
}

const AgendaModel = getModelForClass(Agenda);

export default AgendaModel;
