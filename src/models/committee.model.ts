import { prop, getModelForClass, Ref, modelOptions } from '@typegoose/typegoose';
import { Person } from './person.model';
import { CommitteeSession } from './committeeSession.model';
import { Bill } from './bill.model';

enum CommitteeType {
  Main = 'main',
  Special = 'special',
  Joint = 'joint',
  Knesset = 'knesset',
}

enum CommitteeSubType {
  Permanent = 'permanent',
  Special = 'special',
  Investigation = 'investigation',
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Committee {
  @prop({ required: true, unique: true, type: Number })
  originId!: number;

  @prop({ required: true })
  name!: string;

  @prop()
  knessetNum?: number;

  @prop({ enum: CommitteeType })
  type?: CommitteeType;

  @prop({ enum: CommitteeSubType })
  subType?: CommitteeSubType;

  @prop()
  email?: string;

  @prop({ ref: 'Committee' })
  parentCommittee?: Ref<Committee>;

  @prop({ ref: 'Person' })
  headOfCommittee?: Ref<Person>;

  @prop({ ref: 'Person' })
  members?: Ref<Person>[];

  @prop({ ref: 'CommitteeSession' })
  sessions?: Ref<CommitteeSession>[];

  @prop({ ref: 'Bill' })
  bills?: Ref<Bill>[];
}

const CommitteeModel = getModelForClass(Committee);
export default CommitteeModel;
