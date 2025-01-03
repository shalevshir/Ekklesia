import { IsString, IsArray, IsNumber } from 'class-validator';
import { AirtableRecord } from './airtableRecord';

export class MinistryRecord extends AirtableRecord {
  @IsString()
  Name!: string;

  @IsArray()
  @IsString({ each: true })
  minister!: string[];

  @IsArray()
  @IsString({ each: true })
  Queries!: string[];

  @IsNumber()
  'timeToAnswer Rollup (from Queries)'!: number;
}
