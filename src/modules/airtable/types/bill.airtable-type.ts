import { IsString, IsArray, IsDate, IsNumber, IsObject } from 'class-validator';
import { CommitteeRecord } from '../../../types/committee.airtable-type';
import { AirtableRecord } from './airtableRecord';

export class BillRecord extends AirtableRecord {

  @IsString()
  _id!: string;

  @IsArray()
  @IsObject({ each: true })
  committee!: CommitteeRecord[];

  @IsDate()
  date!: Date;

  @IsString()
  name!: string;

  @IsNumber()
  number!: number;

  @IsString()
  status!: string;

  @IsNumber()
  statusOrder!: number;

  @IsString()
  summary!: string;

  @IsString()
  type!: string;

  @IsString()
  billLink!: string;

  @IsArray()
  @IsString({ each: true })
  'Main Category'!: string[];

  @IsArray()
  @IsString({ each: true })
  'Sub Categories'!: string[];

  @IsArray()
  @IsString({ each: true })
  CommitteeSessions!: string[];

  @IsString()
  billDisplayName!: string;

  @IsArray()
  @IsString({ each: true })
  'Sub Categories (from Main Category)'!: string[];

  @IsArray()
  @IsString({ each: true })
  mainCategoryName!: string[];

  @IsString()
  text!: string;

  @IsArray()
  @IsString({ each: true })
  categoriesNames!: string[];

  @IsDate()
  'Last Modified summary'!: Date;
}
