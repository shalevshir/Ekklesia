import { FieldSet } from 'airtable';
import { IsString, IsArray, IsDate, IsNumber } from 'class-validator';
import { AirtableRecord } from './airtableRecord';

export class MainCategoryRecord extends AirtableRecord implements FieldSet {
  @IsString()
  _id!: string;

  @IsString()
  name!: string;

  @IsDate()
  createdAt!: Date;

  @IsDate()
  updatedAt!: Date;

  @IsArray()
  @IsString({ each: true })
  'Sub Categories'!: string[];

  @IsArray()
  @IsString({ each: true })
  Bills!: string[];

  @IsArray()
  @IsString({ each: true })
  Queries!: string[];

  @IsArray()
  @IsString({ each: true })
  'Subcategories Names'!: string[];

  @IsDate()
  Created!: Date;

  @IsDate()
  'Last Modified'!: Date;

  @IsArray()
  @IsString({ each: true })
  'subCategories Ids'!: string[];

  @IsNumber()
  coalitionCount!: number;

  @IsNumber()
  opositionCount!: number;

  @IsNumber()
  Calculation!: number;
}
