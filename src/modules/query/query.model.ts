import { prop, getModelForClass, Ref, modelOptions } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Person } from '../person/person.model';
import { Ministry } from '../ministry/ministry.model';
import { MainCategory } from '../category/mainCategory.model';
import { SubCategory } from '../category/subCategory.model';

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

  @prop({ ref: Array<MainCategory> })
    mainCategories!: Ref<MainCategory>[];

  @prop({ ref: Array<SubCategory> })
    subCategories!: Ref<SubCategory>[];
}

const QueryModel = getModelForClass(Query);

export default QueryModel;
