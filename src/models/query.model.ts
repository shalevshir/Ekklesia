import { prop, getModelForClass, Ref, modelOptions } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Person } from "./person.model";
import { Ministry } from "./ministry.model";
import { Category } from "./category.model";
import { ModelType } from "typegoose";

@modelOptions({ schemaOptions: { timestamps: true } })
export class Query extends TimeStamps {
  @prop({ index: true })
  name?: string;

  @prop()
  originId?: string;

  @prop()
  queryLink?: string;

  @prop()
  replyLink?: string;

  @prop({ enum: ["type1", "type2"] })
  type?: string;

  @prop()
  description?: string;

  @prop({ enum: ["pending", "answered"] })
  status?: string;

  @prop()
  submitDate?: Date;

  @prop()
  replyDate?: Date;

  @prop({ ref: "Person" })
  submitter?: Ref<Person>;

  @prop({ ref: "Ministry" })
  replyMinistry?: Ref<Ministry>;

  @prop({ ref: "Category" })
  categories?: Ref<Category>[];
}

const QueryModel = getModelForClass(Query) as unknown as ModelType<Query>;

export default QueryModel;
