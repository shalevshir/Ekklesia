import { prop, getModelForClass, Ref, modelOptions } from "@typegoose/typegoose";
import { Committee } from "./committee.model";
import { ModelType } from "typegoose";

@modelOptions({ schemaOptions: { timestamps: true } })
export class Category {
    @prop()
    name?: string;

    @prop()
    description?: string;

    @prop()
    icon?: string;

    @prop()
    isMainCategory?: boolean;

    @prop({ ref: Category })
    subCategories?: Ref<Category>[];

    @prop({ ref: Committee })
    committee?: Ref<Committee>;
}

const CategoryModel = getModelForClass(Category) as unknown as ModelType<Category>;
export default CategoryModel;
