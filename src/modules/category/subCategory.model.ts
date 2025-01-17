import { prop, getModelForClass, modelOptions, Ref, index } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { timestamps: true } })
@index({ name: 1, mainCategory: 1 }, { unique: true })
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
