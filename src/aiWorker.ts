import { airtableBase, connectDB } from './utils/db';
import logger from './utils/logger';
import { DataInsertionGraph } from './graphs/dataInsertion';
import {  downloadAndSaveFile, getFileAsText } from './utils/files.service';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';
import { runSummarize } from './graphs/agents/summarize';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import fs from 'fs';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const startWorker = async () => {
  // await connectDB();
  const billsBase = airtableBase('bills');

  const bills = await billsBase.select({filterByFormula:'AND({Last Modified summary} < DATETIME_PARSE("2024-07-28 14:35", "YYYY-MM-DD HH:mm"),billLink != "")'}).all();
  for( let i = 0; i < bills.length; i++){
    const bill = bills[i];
    const link = bill.get('billLink');

    if(!link) continue;
    const file = await downloadAndSaveFile(link as string);
    const blob = await fs.openAsBlob(file);
    let docLoader
    if (file.endsWith('.docx') || file.endsWith('.doc')) {
      docLoader = new DocxLoader(blob);
    }else{
      docLoader = new PDFLoader(blob);
    } 
    
    const doc = await docLoader.load()
    let summary;
    try{
      summary = await runSummarize(doc);
    } catch(err){
      logger.error('error summarizing bill', err);
      await wait(3000);
      continue;
    }
    
    try{
      await bill.updateFields({ summary: summary?.content as string });
      await wait(3000);
    } catch(err){
      logger.error('error saving bill', err);
    }
  }
};

startWorker().then((res) => {
  logger.info('worker started');
}).catch((err) => {

  logger.error('error starting worker', err);
})
