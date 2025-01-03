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

  async fetchExampleRecord(tableName: string) {
    const table = this.base(tableName);
    const records = await table.select({ maxRecords: 1 }).firstPage();
    if (records.length > 0) {
      console.log('Example Record:', records[0].fields);
    } else {
      console.log('No records found in table:', tableName);
    }
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

  async read(filter: airtable.SelectOptions<T> = {}) {
    return this.table.select(filter).all();
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
