import { prop, getModelForClass, Ref, modelOptions } from "@typegoose/typegoose";
import { rolesEnum } from "../types/roles.enum";
import { ModelType } from "typegoose";
import { Ministry } from "./ministry.model";

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
  @prop()
  originId?: string;

  @prop()
  name?: string;

  @prop()
  displayName?: string;

  @prop({ _id: false })
  block?: Block;
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

  @prop({ type: () => [Role] })
  roles?: Role[];

  @prop()
  dateOfBirth?: Date;

  @prop()
  residence?: string;

  @prop({ _id: false })
  faction?: Faction;

  @prop({ type: () => [Committee] })
  committees?: Committee[];

  @prop({ type: () => [Ministry] })
  minister?: Ref<Ministry>[];

  @prop()
  email?: string;

  @prop()
  originId?: string;
}

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


const PersonModel = getModelForClass(Person) as unknown as ModelType<Person>;

export default PersonModel;
