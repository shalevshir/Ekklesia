import { FieldSet } from 'airtable';
import { IsString, IsArray, IsDate, IsNumber } from 'class-validator';
import { AirtableRecord } from './airtableRecord';

export class CommitteeSessionRecord extends AirtableRecord {

  @IsDate()
  date!: Date;

  @IsNumber()
  sessionNumber!: number;

  @IsString()
  type!: string;

  @IsString()
  status!: string;

  @IsString()
  broadcastUrl!: string;

  @IsString()
  sessionUrl!: string;

  @IsString()
  transcriptUrl!: string;

  @IsString()
  committee!: string;

  @IsNumber()
  totalNumberOfSessions!: number;

  @IsArray()
  @IsString({ each: true })
  bills!: string[];

  @IsArray()
  @IsString({ each: true })
  attendees!: string[];
}
