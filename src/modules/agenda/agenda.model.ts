import { prop, getModelForClass, modelOptions, Ref } from '@typegoose/typegoose';
import { IsInt, IsString, IsOptional, MaxLength, IsDate, IsUrl } from 'class-validator';
import { Person } from '../person/person.model';
import { Committee } from '../committee/committee.model';
import { Ministry } from '../ministry/ministry.model';
import { Type } from 'class-transformer';

class AgendaDocument{
  @prop()
  @IsUrl()
    url!: string;

  @prop()
  @IsString()
    type!: string;
}
@modelOptions({ schemaOptions: { timestamps: true } })
export class Agenda {
  @prop({ required: true })
  @IsInt()
    originId!: number;
  
  @prop()
  @IsString()
    classificationDesc!: string;

  @prop({ref: 'Agenda', foreignField: 'originId', localField: 'leadingAgenda'})
  @IsOptional()
  @Type(() => Agenda)
    leadingAgenda!: Ref<Agenda>;

  @prop()
  @IsInt()
    knessetNum!: number;

  @prop()
  @IsString()
    name!: string;

  @prop()
  @IsString()
    type!: string;

  @prop()
  @IsOptional()
  @IsInt()
    status!: string;

  @prop({ref: 'Person'})
  @Type(() => Person)
    initiator!: Ref<Person>;

  @prop()
  @IsOptional()
  @IsString()
    govRecommendation?: string;

  @prop()
  @IsOptional()
  @IsDate()
    presidentDecisionDate?: Date;

  @prop()
  @IsOptional()
  @IsString()
  @MaxLength(125)
    postponementReasonDesc?: string;

  @prop({ref: 'Committee'})
  @IsOptional()
    committee?: Ref<Committee>;

  @prop({ref: 'Ministry'})
  @IsOptional()
    minister?: Ref<Ministry>;

  @prop()
  @IsOptional()
  @Type(() => AgendaDocument)
    documents?: AgendaDocument[];
}

export default getModelForClass(Agenda);
