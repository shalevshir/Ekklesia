import { prop, getModelForClass, Ref, modelOptions } from "@typegoose/typegoose";
import { rolesEnum } from "../../types/roles.enum";
import { Ministry } from "../ministry/ministry.model";

class Role {
  @prop({ enum: rolesEnum })
  title?: string;

  @prop()
  startDate?: Date;

  @prop()
  endDate?: Date;

  @prop()
  isCurrent?: boolean;
}

class Block {
  @prop({ enum: ["coalition", "opposition"] })
  name?: string;
}

class Committee {
  @prop()
  name?: string;

  @prop({ ref: "Committee" })
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

  @prop({ enum: ["coalition", "opposition"] })
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

  @prop({ enum: ["male", "female"] })
  gender?: string;

  @prop({ _id: false, type: [ Role ] })
  roles?: Role[];

  @prop()
  dateOfBirth?: Date;

  @prop()
  residence?: string;

  @prop({ _id: false })
  faction?: Faction;

  @prop({ type: [ Committee ] })
  committees?: Committee[];

  @prop({ type: [ Ministry ] })
  minister?: Ref<Ministry>[];

  @prop()
  email?: string;

  @prop({unique:true, required:true, type: Number})
  originId?: number;
}


const PersonModel = getModelForClass(Person);

export default PersonModel;
