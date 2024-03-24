import { google, sheets_v4 as sheetsV4 } from 'googleapis';
// Define your Google Sheets service class
class SheetsService {
  private sheets: sheetsV4.Sheets;

  constructor(auth: any) {
    // Create a new instance of the Google Sheets API
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  static getAuth(authFile: string) {
    const auth = new google.auth.GoogleAuth({
      keyFile: authFile,
      scopes: [ 'https://www.googleapis.com/auth/spreadsheets' ]
    });

    return auth.getClient();
  }


  async readSheet(sheetId: string, range?: string): Promise<any[]|undefined> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range || 'Sheet1'

      });

      const rows = response.data.values;
      const headers = rows ? rows [0] : [];
      const data = rows?.slice(1);

      const jsonData = data?.map((row: any) => {
        const rowData: any = {};
        headers.forEach((header: any, index: any) => {
          rowData[header] = row[index];
        });
        return rowData;
      });

      return jsonData;
    } catch (error) {
      console.error('Error reading sheet:', error);
      throw error;
    }
  }

  async appendSheet(sheetId: string, range: string, values: Record<string, string[]>[]): Promise<void> {
    try {
      const mappedValues = values.map((value) => Object.values(value));

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: { values: mappedValues }
      });


      console.log('Sheet appended:', response.data);
    } catch (error) {
      console.error('Error appending to sheet:', error);
      throw error;
    }
  }

  async writeSheet(sheetId: string, range: string, values: Record<string, any>): Promise<void> {
    try {
      const headers = Object.keys(values[0]);
      const mappedValues = values.map((value: any) => Object.values(value));
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: { values: [ headers, ...mappedValues ] }
      });

      console.log('Sheet updated:', response.data);
    } catch (error) {
      console.error('Error writing to sheet:', error);
      throw error;
    }
  }
}

export default SheetsService;
