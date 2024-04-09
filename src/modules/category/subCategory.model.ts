import { prop, getModelForClass, modelOptions, Ref } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { timestamps: true } })
export class SubCategory {
    @prop({ required: true })
      name!: string;

    @prop()
      description?: string;

    @prop({ ref: 'MainCategory' })
      mainCategory?: Ref<string>;

    @prop({ type: [ Number ] })
      vector?: number[];
}

const SubCategoryModel = getModelForClass(SubCategory);

export default SubCategoryModel;
