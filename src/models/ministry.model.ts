import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';
import { ModelType } from 'typegoose';

@modelOptions({ schemaOptions: { timestamps: true } })
export class Ministry {
    @prop({ required: true })
    name?: string;

    @prop({ required: true })
    originId?: string;
}

const MinistryModel = getModelForClass(Ministry) as unknown as ModelType<Ministry>;
export default MinistryModel;