import { IsString, IsArray, IsDate, IsOptional, IsObject } from 'class-validator';
import { AirtableRecord } from './airtableRecord';

export class QueryRecord extends AirtableRecord {
  @IsString()
  _id!: string;

  @IsDate()
  createdAt!: Date;

  @IsString()
  name!: string;

  @IsString()
  queryLink!: string;

  @IsArray()
  @IsString({ each: true })
  replyMinistry!: string[];

  @IsString()
  status!: string;

  @IsDate()
  submitDate!: Date;

  @IsArray()
  @IsString({ each: true })
  submitter!: string[];

  @IsString()
  type!: string;

  @IsDate()
  updatedAt!: Date;

  @IsArray()
  @IsString({ each: true })
  MainCategory!: string[];

  @IsArray()
  @IsString({ each: true })
  SubCategories!: string[];

  @IsArray()
  @IsString({ each: true })
  submitterFaction!: string[];

  @IsOptional()
  @IsObject()
  timeToAnswer?: { specialValue: string };

  @IsString()
  queryText!: string;

  @IsArray()
  @IsString({ each: true })
  categories!: string[];
}