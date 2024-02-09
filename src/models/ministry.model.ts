import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';
import { ModelType } from '../abstracts/repo.abstract';

@modelOptions({ schemaOptions: { timestamps: true } })
export class Ministry {
    @prop({ required: true })
    name!: string;

    @prop({ required: true })
    originId!: string;
}

const MinistryModel = getModelForClass(Ministry) as ModelType<Ministry>; 
export default MinistryModel;