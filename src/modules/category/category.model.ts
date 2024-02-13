import { prop, getModelForClass, Ref, modelOptions } from "@typegoose/typegoose";
import { Committee } from "../committee/committee.model";

@modelOptions({ schemaOptions: { timestamps: true } })
export class Category {
    @prop({ required:true })
    name!: string;

    @prop()
    description?: string;

    @prop()
    icon?: string;

    @prop()
    isMainCategory!: boolean;

    @prop({ ref: Category })
    subCategories?: Ref<Category>[];

    @prop({ ref: Committee })
    committee?: Ref<Committee>;
}

const CategoryModel = getModelForClass(Category)

export default CategoryModel;