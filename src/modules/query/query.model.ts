import { prop, getModelForClass, Ref, modelOptions } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Person } from '../person/person.model';
import { Ministry } from '../ministry/ministry.model';
import { Category } from '../category/category.model';

@modelOptions({ schemaOptions: { timestamps: true } })
export class Query extends TimeStamps {
  @prop({ index: true, required: true })
    name!: string;

  @prop({ unique: true, required: true, type: Number })
    originId!: number;

  @prop()
    queryLink?: string;

  @prop()
    replyLink?: string;

  @prop({ enum: [ 'regular', 'urgent', 'direct' ] })
    type?: string;

  @prop()
    description?: string;

  @prop({ enum: [ 'pending', 'answered' ] })
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
