import { Ministry } from './../../ministry/ministry.model';
import { AirtableRecord } from './airtableRecord';
import { IsString, IsArray, IsNumber, IsOptional } from 'class-validator';

export class PersonRecord extends AirtableRecord {

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsArray()
  @IsString({ each: true })
  roles!: string[];

  @IsArray()
  @IsString({ each: true })
  FactionsName!: string[];

  @IsString()
  gender!: string;

  @IsArray()
  @IsString({ each: true })
  Committees!: string[];

  @IsArray()
  @IsString({ each: true })
  CommitteeSessions!: string[];

  @IsString({ each: true })
  Ministry!: string[];

  @IsArray()
  @IsString({ each: true })
  Bills!: string[];

  @IsArray()
  @IsString({ each: true })
  Queries!: string[];

  @IsString()
  Name!: string;

  @IsString()
  block!: string;

  @IsNumber()
  numberOfBills!: number;

  @IsNumber()
  numberOfQueries!: number;

  @IsNumber()
  numberOfCommittees!: number;

  @IsNumber()
  numberOfCommitteesSessions!: number;

  @IsNumber()
  totalNumberOfSessionsInCommittees!: number;

  @IsArray()
  @IsString({ each: true })
  billStatuses!: string[];
}
