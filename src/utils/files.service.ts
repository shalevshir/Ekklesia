import csv from 'csv-parser';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import logger from './logger';
import mammoth from 'mammoth';

async function getFileAsHtml(url: string): Promise<string> {
    const response = await downloadAndSaveFile(url);
    const data = await mammoth.convertToHtml({path: response});

    fs.unlink(response, (err) => {
      if (err) {
        logger.error('Error deleting file:', err);
      }
    });
    return data.value;
}

async function getFileAsText(url: string): Promise<string> {
    const response = await downloadAndSaveFile(url);
    const data = await mammoth.extractRawText({path: response});

    fs.unlink(response, (err) => {
      if (err) {
        logger.error('Error deleting file:', err);
      }
    });
    return data.value;
}


async function downloadAndSaveFile(url: string): Promise<string>{
    try {
        const response = await axios.get(url, { responseType: 'stream' });
        const fileName = path.basename(url);
        const filePath = path.join(__dirname, '../..', 'public', fileName);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(filePath));
            writer.on('error', reject);
        });
    } catch (error) {
        logger.error('Error downloading file:', error);
        throw error;
    }
}


async function readCsv(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error: any) => {
        reject(error);
      });
  });
}
export { downloadAndSaveFile, getFileAsHtml, getFileAsText, readCsv }
