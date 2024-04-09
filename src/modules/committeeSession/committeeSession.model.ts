import { prop, getModelForClass, Ref, modelOptions } from '@typegoose/typegoose';
import { Committee } from '../committee/committee.model';
import { Bill } from '../bill/bill.model';
import { Person } from '../person/person.model';
import { MainCategory } from '../category/mainCategory.model';
import { SubCategory } from '../category/subCategory.model';

export enum SessionType {
  Open = 'open',
  Tour = 'tour',
  Secret = 'secret',
}

export enum AttendeeRole {
  Chairman = 'chairman',
  Member = 'member',
  Guest = 'guest',
}

export class Attendee {
  @prop({ ref: Person })
    person!: Ref<Person>;

  @prop({ enum: AttendeeRole })
    role?: AttendeeRole;
};

@modelOptions({ schemaOptions: { timestamps: true } })
export class CommitteeSession {
  @prop({ unique: true, required: true, type: Number })
    originId!: number;

  @prop({ type: Date })
    date?: Date;

  @prop()
    topic?: string;

  @prop({ type: Number })
    sessionNumber?: number;

  @prop({ enum: SessionType })
    type?: SessionType;

  @prop()
    status?: string;

  @prop()
    broadcastUrl?: string;

  @prop()
    sessionUrl?: string;

  @prop()
    transcriptUrl?: string;

  @prop({ ref: Committee })
    committee?: Ref<Committee>;

  @prop({ ref: Bill })
    bills?: Ref<Bill>[];

  @prop({ type: [ Attendee ] })
    attendees?: Attendee[];

  @prop({ ref: MainCategory })
    categories?: Ref<MainCategory>[];

  @prop({ ref: SubCategory })
    subCategories?: Ref<SubCategory>[];

  @prop({ type: [ String ] })
    missingAttendees?: string[];
}

const CommitteeSessionModel = getModelForClass(CommitteeSession);

export default CommitteeSessionModel;
