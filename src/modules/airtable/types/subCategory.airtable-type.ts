import { FieldSet } from 'airtable';
import { IsString, IsArray, IsDate, IsNumber } from 'class-validator';
import { AirtableRecord } from './airtableRecord';

export class SubCategoryRecord extends AirtableRecord{

  @IsString()
  name!: string;

  @IsString()
  _id!: string;

  @IsArray()
  @IsString({ each: true })
  mainCategory!: string[];

  @IsDate()
  createdAt!: Date;

  @IsDate()
  updatedAt!: Date;

  @IsNumber()
  __v!: number;

  @IsArray()
  @IsString({ each: true })
  Bills!: string[];

  @IsArray()
  @IsString({ each: true })
  Queries!: string[];

  @IsArray()
  @IsString({ each: true })
  'Main category name'!: string[];

  @IsDate()
  lastm!: Date;

  @IsArray()
  @IsString({ each: true })
  mainCategoryId!: string[];

}
