import { prop, getModelForClass, Ref, modelOptions, index } from '@typegoose/typegoose';
import { SubCategory } from './subCategory.model';

@modelOptions({ schemaOptions: { timestamps: true } })
@index({ name: 1 }, { unique: true })
export class MainCategory {
    @prop({ required: true })
      name!: string;

    @prop()
      description?: string;

    @prop({ ref: SubCategory })
      subCategories?: Ref<SubCategory>[];

    @prop({ type: [ Number ] })
      vector?: number[];
}

const MainCategoryModel = getModelForClass(MainCategory);

export default MainCategoryModel;
