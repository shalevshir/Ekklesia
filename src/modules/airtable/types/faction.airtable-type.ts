import { IsString, IsArray, IsNumber } from 'class-validator';
import { AirtableRecord } from './airtableRecord';

export class FactionRecord extends AirtableRecord {
  @IsString()
  Name!: string;

  @IsString()
  block!: string;

  @IsArray()
  @IsString({ each: true })
  Members!: string[];

  @IsNumber()
  numberOfMembers!: number;

  @IsArray()
  @IsString({ each: true })
  bills!: string[];
}
