import { Prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { IsBoolean, IsDate, IsInt, IsString } from 'class-validator';

export class PlenumSessionItem {
  @Prop({ required: true, unique: true })
  @IsInt()
  itemId!: number;

  @Prop({ required: true, ref: () => PlenumSession })
  @IsInt()
  plenumSessionId!: Ref<PlenumSession>;

  @Prop({ required: true })
  @IsInt()
  itemTypeId!: number;

  @Prop({ required: true })
  @IsString()
  itemTypeDesc!: string;

  @Prop({ required: true })
  @IsInt()
  ordinal!: number;

  @Prop({ required: true })
  @IsString()
  name!: string;

  @Prop({ required: true })
  @IsInt()
  statusId!: number;

  @Prop({ required: true })
  @IsBoolean()
  isDiscussion!: boolean;

  @Prop({ required: true })
  @IsDate()
  lastUpdatedDate!: Date;
}

export const PlenumSessionItemModel = getModelForClass(PlenumSessionItem);

export class PlenumSession {
  @Prop({ required: true, unique: true })
  @IsInt()
  originId!: number;

  @Prop({ required: true })
  @IsInt()
  number!: number;

  @Prop({ required: true })
  @IsInt()
  knessetNum!: number;

  @Prop({ required: true })
  @IsString()
  name!: string;

  @Prop({ required: true })
  @IsDate()
  startDate!: Date;

  @Prop({ required: true })
  @IsDate()
  finishDate!: Date;

  @Prop({ required: true })
  @IsBoolean()
  isSpecialMeeting!: boolean;

  @Prop({ required: true })
  @IsDate()
  lastUpdatedDate!: Date;

  @Prop({ ref: () => PlenumSessionItem })
  items?: Ref<PlenumSessionItem>[]; // Reference to related items
}

export const PlenumSessionModel = getModelForClass(PlenumSession);
