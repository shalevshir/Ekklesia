import { prop, getModelForClass, modelOptions, ReturnModelType } from "@typegoose/typegoose";
import BaseRepo, { ModelType } from "../abstracts/repo.abstract";
import { AnyParamConstructor } from "@typegoose/typegoose/lib/types";

@modelOptions({ schemaOptions: { timestamps: true } })
class Agenda extends BaseRepo<Agenda> {
  @prop({ required: true })
  originId!: number;

  @prop({ required: true })
  name!: string;
}

const AgendaModel = getModelForClass(Agenda) as ModelType<Agenda>;

export default AgendaModel;