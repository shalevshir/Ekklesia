import { prop, getModelForClass, Ref, modelOptions } from '@typegoose/typegoose';
import { Person } from '../person/person.model';
import { Committee } from '../committee/committee.model';
import { Category } from '../category/category.model';

export enum Vote {
  FOR = 'for',
  AGAINST = 'against',
  ABSTAIN = 'abstain',
  NO_VOTE = 'no-vote',
}

class VoteSchema {
  @prop({ required:true, ref: Person })
  person!: Ref<Person>;

  @prop({ enum: Vote, default: Vote.NO_VOTE})
  vote?: Vote;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class StageSchema {
  @prop({ enum: ['first-reading', 'second-reading', 'committee', 'third-reading'] })
  name?: string;

  @prop()
  description?: string;

  @prop()
  date?: Date;

  @prop({ type: [ VoteSchema ] })
  votes?: VoteSchema[];

  @prop({ type: String })
  sessionId?: string;

  @prop({ type: String })
  result?: string;
}

export class Bill {
  @prop({ required: true })
  originId!: string;

  @prop({ required: true })
  name!: string;

  @prop()
  number?: number;

  @prop()
  pNumber?: number;

  @prop()
  displayName?: string;

  @prop()
  summary?: string;

  @prop()
  topic?: string;

  @prop()
  billLink?: string;

  @prop({ enum: ['governmental', 'private', 'committee'] })
  type?: string;

  @prop()
  status?: string;

  @prop()
  date?: Date;

  @prop({ ref: Committee })
  committee?: Ref<Committee>;

  @prop({ ref: Array<Person> })
  initiators?: Ref<Person>[];

  @prop({ type: [ StageSchema ] })
  stages?: StageSchema[];

  @prop({ ref: Array<Category> })
  categories?: Ref<Category>[];
}

const BillModel = getModelForClass(Bill)

export default BillModel;
