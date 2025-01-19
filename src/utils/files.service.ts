import csv from 'csv-parser';
import axios, { AxiosError } from 'axios';
import fs from 'fs';
import path from 'path';
import logger from './logger';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { Document } from '@langchain/core/documents';

async function getFileAsHtml(url: string): Promise<string> {
  const response = await downloadAndSaveFile(url);
  const data = await mammoth.convertToHtml({ path: response });

  fs.unlink(response, (err) => {
    if (err) {
      logger.error('Error deleting file:', err);
    }
  });
  return data.value;
}

async function getFileAsText(url: string): Promise<string | undefined> {
  try {
    const response = await downloadAndSaveFile(url);
    let data;
    if (response.endsWith('.docx') || response.endsWith('.doc')) {
      data = await extractTextFromDocx(response);
    } else if (response.endsWith('.pdf')) {
      data = await extractTextFromPdf(response);
    }
    fs.unlink(response, (err) => {
      if (err) {
        logger.error('Error deleting file:', err);
      }
    });
    return data;
  } catch (error) {
    logger.error('Error processing file:', error);
    throw error;
  }
}

async function getFileAsDocument(link:string):Promise<Document[]>{
  const file = await downloadAndSaveFile(link as string);
  const blob = await fs.openAsBlob(file);
  let docLoader
  if (file.endsWith('.docx') || file.endsWith('.doc')) {
    docLoader = new DocxLoader(blob);
  }else{
    docLoader = new PDFLoader(blob);
  } 
  
  const doc = await docLoader.load()
  return doc ? cleanDocText(doc) : [];
}

function cleanDocText(doc:Document[]): Document[] {
  return doc.map(d => {
    d.pageContent = d.pageContent.replace(/(\r\n|\n|\r)/gm, " ");
    return d;
  });
}

async function extractTextFromDocx(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

async function extractTextFromPdf(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const result = await pdf(dataBuffer);
  return result.text;
}


async function downloadAndSaveFile(url: string): Promise<string> {
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const fileName = path.basename(url);
    const filePath = path.join( '/tmp', fileName);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });
  } catch (error) {
    if (error instanceof AxiosError && error?.response?.status === 503) {
      logger.error('UnavailableError', { url });
      throw new Error('Unavailable Link');
    } else {
      logger.error('Error downloading file:', error);
      throw error;
    }
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
export { getFileAsDocument, downloadAndSaveFile, getFileAsHtml, getFileAsText, readCsv };
