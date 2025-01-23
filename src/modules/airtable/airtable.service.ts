import airtable, { FieldSet, Table as AirtableTableType } from 'airtable';
import { envVars } from '../../utils/envVars';

export enum TableNames {
  Queries = 'Queries',
  Bills = 'Bills',
  Committees = 'Committees',
  CommitteeSessions = 'CommitteeSessions',
  Ministry = 'Ministry',
  People = 'People',
  Factions = 'Factions',
  MainCategories = 'Main Categories',
  SubCategories = 'Sub Categories',
}

class AirtableService {
  private base: airtable.Base;
  constructor(apiKey: string, baseId: string) {
    this.base = new airtable({ apiKey }).base(baseId);
  }

  getTableInstance<T extends FieldSet>(tableName: TableNames) {
    return new AirtableTable<T>(this.base(tableName));
  }

  async getTableFields(tableName: string) {
    const table = this.base(tableName);
    const records = await table.select({ maxRecords: 20 }).firstPage();
    const fields = new Set<string>();
    records.forEach(record => {
      Object.keys(record.fields).forEach(field => {
        fields.add(field);
      });
    });
    return Array.from(fields);
  }
}

class AirtableTable<T extends FieldSet> {
  private table: AirtableTableType<T>;

  constructor(table: AirtableTableType<T>) {
    this.table = table;
  }

  async create(record: T) {
    return this.table.create(record);
  }
  async getById(id: string) {
    return this.table.find(id);
  }

  async fetch(filter: airtable.SelectOptions<T> = {}, populate?: { field: string, table: TableNames }) {
    const records = await this.table.select(filter).all();
    if (populate) {
      const relatedTable = airtableService.getTableInstance(populate.table);
      for (const record of records) {
        const relatedRecordId = record.fields[populate.field] as string;
        if (relatedRecordId) {
          const relatedRecords = await relatedTable.fetch({ filterByFormula: `{id} = '${relatedRecordId}'` });
          (record.fields as any)[populate.field] = relatedRecords[0];
        }
      }
    }
    return records;
  }

  async update(id: string, fields: Partial<T>) {
    return this.table.update(id, fields);
  }

  async delete(id: string) {
    return this.table.destroy(id);
  }
}

if(!envVars.AIRTABLE_API_KEY || !envVars.AIRTABLE_BASE_ID) {
  throw new Error('Airtable API key and base ID must be provided');
}

const airtableService = new AirtableService(envVars.AIRTABLE_API_KEY, envVars.AIRTABLE_BASE_ID);

export default airtableService;
