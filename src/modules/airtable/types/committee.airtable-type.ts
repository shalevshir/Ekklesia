import { FieldSet } from 'airtable';
import { AirtableRecord } from './airtableRecord';
import { IsString } from 'class-validator';

export class CommitteeRecord extends AirtableRecord {
  @IsString()
  _id!: string;

  @IsString()
  name!: string;
}
