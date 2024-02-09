import { prop, getModelForClass, Ref, modelOptions } from "@typegoose/typegoose";
import { Committee } from "./committee.model";
import { Bill } from "./bill.model";
import { Person } from "./person.model";
import { Category } from "./category.model";
import { ModelType } from "../abstracts/repo.abstract";

enum SessionType {
  Open = "open",
  Tour = "tour",
  Secret = "secret",
}

enum AttendeeRole {
  Chairman = "chairman",
  Member = "member",
  Guest = "guest",
}

class Attendee {
  @prop({ ref: Person })
  person!: Ref<Person>;

  @prop({ enum: AttendeeRole })
  role?: AttendeeRole;
};

@modelOptions({ schemaOptions: { timestamps: true } })
export class CommitteeSession {
  @prop({ unique: true, required: true, type: Number})
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
  attendees?: [ Attendee ];

  @prop({ ref: Category })
  categories?: Ref<Category>[];
}

const CommitteeSessionModel = getModelForClass(CommitteeSession) as ModelType<CommitteeSession>;

export default CommitteeSessionModel;
