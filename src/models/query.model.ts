import { prop, getModelForClass, Ref, modelOptions } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Person } from "./person.model";
import { Ministry } from "./ministry.model";
import { Category } from "./category.model";

@modelOptions({ schemaOptions: { timestamps: true } })
export class Query extends TimeStamps {
  @prop({ index: true, required: true})
  name!: string;

  @prop({ required: true })
  originId!: string;

  @prop()
  queryLink?: string;

  @prop()
  replyLink?: string;

  @prop({ enum: ["regular", "urgent", "direct"] })
  type?: string;

  @prop()
  description?: string;

  @prop({ enum: ["pending", "answered"] })
  status?: string;

  @prop()
  submitDate?: Date;

  @prop()
  replyDate?: Date;

  @prop({ ref: Person })
  submitter?: Ref<Person>;

  @prop({ ref: Ministry })
  replyMinistry!: Ref<Ministry>;

  @prop({ ref: Array<Category> })
  categories!: Ref<Category>[];
}

const QueryModel = getModelForClass(Query);

export default QueryModel;
