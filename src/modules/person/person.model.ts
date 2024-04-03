import { prop, getModelForClass, Ref, modelOptions } from '@typegoose/typegoose';
import { rolesEnum } from '../../types/roles.enum';
import { Ministry } from '../ministry/ministry.model';
import { Bill } from '../bill/bill.model';
import { Query } from '../query/query.model';
import { CommitteeSession } from '../committeeSession/committeeSession.model';

class Role {
  @prop({ enum: rolesEnum })
    title?: string;

  @prop()
    startDate?: Date;

  @prop()
    endDate?: Date;

  @prop()
    isCurrent?: boolean;

  @prop()
    roleOriginId?: number;
}
class Committee {
  @prop()
    name?: string;

  @prop({ ref: 'Committee' })
    committeeId?: Ref<Committee>;

  @prop()
    isChairman?: boolean;
}


class Faction {
  @prop({ type: Number })
    originId?: number;

  @prop()
    name?: string;

  @prop()
    displayName?: string;

  @prop({ enum: [ 'coalition', 'opposition' ] })
    block?: string;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Person {
  @prop()
    firstName?: string;

  @prop()
    lastName?: string;

  @prop()
    firstNameHeb?: string;

  @prop()
    lastNameHeb?: string;

  @prop()
    age?: number;

  @prop({ enum: [ 'male', 'female' ] })
    gender?: string;

  @prop({ _id: false, type: [ Role ] })
    roles?: Role[];

  @prop()
    dateOfBirth?: Date;

  @prop()
    residence?: string;

  @prop({ _id: false })
    faction?: Faction;
  @prop()
    email?: string;

  @prop({ unique: true, required: true, type: Number })
    originId?: number;

  @prop({ type: [ Committee ] })
    committees?: Committee[];

  @prop({ ref: Ministry })
    minister?: Ref<Ministry>[];

  @prop({ ref: Bill })
    bills?: Ref<Bill>[];

  @prop({ ref: Query })
    queries?: Ref<Query>[];

  @prop({ ref: CommitteeSession })
    committeeSessions?: Ref<CommitteeSession>[];
}


const PersonModel = getModelForClass(Person);

export default PersonModel;
