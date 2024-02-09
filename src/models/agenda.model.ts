import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import BaseRepo from "../abstracts/repo.abstract";
import { ModelType } from "typegoose";

@modelOptions({ schemaOptions: { timestamps: true } })
class Agenda extends BaseRepo<Agenda> {
  @prop({ required: true })
  originId!: number;

  @prop({ required: true })
  name!: string;
}

export const AgendaModel = getModelForClass(Agenda) as unknown as ModelType<Agenda>;
