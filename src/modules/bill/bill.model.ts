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

export enum BillStatusesOrder {
  onTable = 0,
  earlyDiscussion = 1,
  preparationForFirstVote = 2,
  firstVote = 3,
  preparationForSecondThirdVote = 4,
  secondThirdVote = 5,
  thirdVote = 6,
  approved = 7,
  stopped = 99,
  notInLegislation = 98,
}

export enum BillStatuses {
  onTable = 'onTable',
  earlyDiscussion = 'earlyDiscussion',
  preparationForFirstVote = 'preparationForFirstVote',
  firstVote = 'firstVote',
  preparationForSecondThirdVote = 'preparationForSecondThirdVote',
  secondThirdVote = 'secondThirdVote',
  thirdVote = 'thirdVote',
  approved = 'approved',
  stopped = 'stopped',
  notInLegislation = 'notInLegislation',
}

export enum BillTypes {
  governmental = 'governmental',
  private = 'private',
  committee = 'committee',
}


class VoteSchema {
  @prop({ required: true, ref: Person })
    person!: Ref<Person>;

  @prop({ enum: Vote, default: Vote.NO_VOTE })
    vote?: Vote;

  @prop({ type: Number })
    originId?: number;

  @prop({ type: String })
    sessionId?: string;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class StageSchema {
  @prop({ enum: [ 'first-reading', 'second-reading', 'committee', 'third-reading' ] })
    name?: string;

  @prop()
    description?: string;

  @prop()
    date?: Date;

  @prop({ type: [ VoteSchema ] })
    votes?: VoteSchema[];

  @prop({ type: String })
    result?: string;
}

export class Bill {
  @prop({ required: true, unique: true, type: Number })
    originId!: number;

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

  @prop({ enum: BillTypes })
    type?: BillTypes;

  @prop({ enum: BillStatuses })
    status?: BillStatuses;

  @prop({ enum: BillStatusesOrder })
    statusOrder?: BillStatusesOrder;

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

  @prop({ type: String })
    documentLink?: string;

  @prop({ type: [ Number ] })
    vector?: number[];

  @prop({ type: [ Category ] })
    newCategories?: Category[];
}

const BillModel = getModelForClass(Bill);

export default BillModel;
