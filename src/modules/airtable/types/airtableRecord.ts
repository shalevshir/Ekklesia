import { FieldSet } from 'airtable';
import { IsString } from 'class-validator';

export abstract class AirtableRecord implements FieldSet {
  [key: string]: any;

  @IsString()
  airtableId!: string;

  @IsString()
  originId!: string;
}
