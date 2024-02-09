import { prop, getModelForClass, Ref, modelOptions } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { Person } from './person.model';
import { Committee } from './committee.model';
import { ModelType } from 'typegoose';

enum Vote {
  FOR = 'for',
  AGAINST = 'against',
  ABSTAIN = 'abstain',
  NO_VOTE = 'no-vote',
}

class VoteSchema {
  @prop({ ref: 'Person' })
  person?: Ref<Person>;

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

  @prop({ type: () => [VoteSchema] })
  votes?: VoteSchema[];
}

export class Bill {
  @prop({ required: true })
  originId?: string;

  @prop()
  name?: string;

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

  @prop({ ref: 'Committee' })
  committee?: Ref<Committee>;

  @prop({ ref: 'Person' })
  initiators?: Ref<Person>[];

  @prop({ type: () => [StageSchema] })
  stages?: StageSchema[];

  @prop({ ref: 'Category' })
  categories?: Types.ObjectId[];
}

const BillModel = getModelForClass(Bill) as unknown as ModelType<Bill>;

export default BillModel;
