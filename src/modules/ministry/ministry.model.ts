import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { timestamps: true } })
export class Ministry {
    @prop({ required: true })
      name!: string;

    @prop({ unique: true, required: true })
      originId!: number;
}

const MinistryModel = getModelForClass(Ministry);
export default MinistryModel;
