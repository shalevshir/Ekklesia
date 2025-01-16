import { ObjectId } from 'mongoose';
import axios from 'axios';
import _ from 'lodash';
import logger from './logger';
import runHistoryRepo from '../modules/runHistory/runHistory.repo';
import { Entities } from '../types/entities.enum';
import { Bill, BillDocument } from '../modules/bill/bill.model';

function wait(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

class KnessetService {
  baseKnessetUrl = 'http://knesset.gov.il/Odata/';
  baseKnessetUrlV4 = 'http://knesset.gov.il/OdataV4/';
  dataBases = {
    parliament: 'ParliamentInfo.svc',
    votes: 'Votes.svc',
    lobby: 'Lobbyist.svc',
    mmm: 'MMM.svc'
  };
  databaseV4 = {
    parliament: 'ParliamentInfo',
    votes: 'Votes',
    lobby: 'Lobbyist',
    mmm: 'MMM'
  };

  axiosInstance = axios.create({
    baseURL: this.baseKnessetUrl
  });

  axiosInstanceV4 = axios.create({
    baseURL: this.baseKnessetUrlV4
  });

  async getMks(): Promise<any[] | undefined> {
    const lastRunDate = await runHistoryRepo.getLatestRunDate(Entities.PERSON);
    const { data } = await this.axiosInstance.get(
      `${ this.baseKnessetUrlV4 }ParliamentInfo/KNS_PersonToPosition?$filter=KnessetNum eq 25 and IsCurrent eq true` +
        (lastRunDate ? ` and LastUpdatedDate gt ${ lastRunDate }` : '') +
        '&$expand=KNS_Person'
    );
    if (!data.value) {
      throw new Error('No persons found');
    }
    const persons = new Set();
    for (const position of data.value) {
      const personObj = position.KNS_Person;
      // find person on the set
      const existPerson = Array.from(persons).find((person: any) => person.Id === personObj.Id) as any;
      if (existPerson) {
        existPerson.positions.push(position);
      } else {
        personObj.positions = [ position ];
        persons.add(personObj);
      }
    }
    return Array.from(persons);
  }

  async accumulateData(data: any) {
    const dataArray = data.value ? data.value : data;
    while (data['odata.nextLink']) {
      // eslint-disable-next-line no-await-in-loop
      const { data: nextData } = await this.axiosInstance.get(
        `${ this.dataBases.parliament }/${ data['odata.nextLink'] }`
      );
      data = nextData;
      const toPush = data.value ? data.value : data;
      dataArray.push(...toPush);
      // eslint-disable-next-line no-await-in-loop
      await wait(0.7);
    }
    return dataArray;
  }

  async getMainCommittees() {
    const lastRunDate = await runHistoryRepo.getLatestRunDate(Entities.COMMITTEE);
    logger.info('Fetching main committees', { lastRunDate });
    const { data } = await this.axiosInstance.get(
      `${ this.dataBases.parliament }/KNS_Committee()?$filter=KnessetNum eq 25 and ParentCommitteeID eq null` +
        (lastRunDate ? ` and LastUpdatedDate gt datetime'${ lastRunDate }'` : '')
    );

    const committees = await this.accumulateData(data);

    return committees;
  }


  async getSubCommittees() {
    const lastRunDate = await runHistoryRepo.getLatestRunDate(Entities.COMMITTEE);
    logger.info('Fetching sub committees', { lastRunDate });
    const { data } = await this.axiosInstance.get(
      `${ this.dataBases.parliament }/KNS_Committee()?$filter=KnessetNum eq 25` +
        (lastRunDate ? ` and LastUpdatedDate gt datetime'${ lastRunDate }'` : '')
    );

    const committees = await this.accumulateData(data);

    return committees;
  }

  async getCommitteeSessions(committeeId: number, entityId?: ObjectId) {
    const lastRunDate = await runHistoryRepo.getLatestRunDate(Entities.COMMITTEE_SESSION, entityId);
    logger.info('Fetching sessions for committee: ', { committeeId, lastRunDate });
    const { data } = await this.axiosInstance.get(
      `${ this.dataBases.parliament }/KNS_Committee(${ committeeId })/KNS_CommitteeSessions` +
          `${ lastRunDate ? `?$filter=LastUpdatedDate gt datetime'${ lastRunDate }'` : '' }`
    );
    return this.accumulateData(data);
  }

  async getCommitteeSessionTranscript(committeeSessionId: number) {
    const url = `${ this.dataBases.parliament }` +
      `/KNS_CommitteeSession(${ committeeSessionId })/KNS_DocumentCommitteeSessions/?$filter=GroupTypeID eq 23`;
    const { data } = await this.axiosInstance.get(
      url
    );
    return data.value;
  }

  async getQueries(limit = 100, skip = 0) {
    const lastRunDate = await runHistoryRepo.getLatestRunDate(Entities.QUERY);
    logger.info({ message: 'Fetching queries, last run:' + lastRunDate, lastRunDate });
    const url =
      'ParliamentInfo/KNS_Query?$expand=KNS_GovMinistry&$filter=KnessetNum eq 25' +
      (lastRunDate ? ` and LastUpdatedDate gt ${ lastRunDate }` : '') +
      `&$top=${limit}&$skip=${skip}` 
    logger.info({ message: 'Fetching queries, url:' + url });
    const res = await this.axiosInstanceV4.get(url);
    return res.data?.value;
  }

  async getQueriesDocuments(queryId: number) {
    const { data } = await this.axiosInstanceV4.get(
      `${ this.databaseV4.parliament }/KNS_DocumentQuery?$filter=QueryID eq ${ queryId }`
    );
    return this.accumulateData(data);
  }
  async getBills() {
    const lastRunDate = await runHistoryRepo.getLatestRunDate(Entities.BILL);
    logger.info('Fetching bills', { lastRunDate });
    const { data } = await this.axiosInstance.get(
      `${ this.dataBases.parliament }/KNS_Bill?$filter=KnessetNum eq 25` +
        (lastRunDate ? ` and LastUpdatedDate gt datetime'${ lastRunDate }'` : '') +
        '&$expand=KNS_BillInitiators'
    );
    return this.accumulateData(data);
  }

  async getBillsLinks(bills: Bill[]) {
    const updateData = [];
    logger.info(`Getting bills links for ${ bills.length } bills`);
    let billNumber = 1;
    for (const bill of bills) {
      const billId = bill.originId;
      logger.info(`Getting bill #${ billNumber } out of ${ bills.length }`, { billId });

      const billLatestDocument = bill.billDocuments?.sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime())[0];
      
      const { data } = await this.axiosInstanceV4.get(
        `${this.databaseV4.parliament}/KNS_DocumentBill?$filter=BillID eq ${billId}`+
        (billLatestDocument ? ` and LastUpdatedDate gt ${new Date(billLatestDocument.updatedDate).toISOString()}` : '')
      );
      if(data?.value?.length){
        const docsList =[]
        for (const doc of data.value) {
          docsList.push({
            type: doc.GroupTypeDesc,
            url: doc.FilePath,
            updatedDate: doc.LastUpdatedDate
          } as BillDocument);
        }
        updateData.push({
          originId: billId,
          billDocuments: docsList
        });
        logger.info(`Finished getting bill #${ billNumber++ } out of ${ bills.length }`, { billId });
      } else {
        logger.info(`No document for bill #${ billNumber++ } out of ${ bills.length }`, billId);
      }
      await wait(0.7);
    }
    return updateData;
  }

  async getCommitteeSessionsBill(sessionId: number) {
    const { data } = await this.axiosInstance.get(
      `${ this.dataBases.parliament }/KNS_CmtSessionItem()?$filter=CommitteeSessionID eq ${ sessionId } and ItemTypeID eq 2`
    );
    return data?.value;
  }

  async getAgendas() {
    const lastRunDate = await runHistoryRepo.getLatestRunDate(Entities.AGENDA);
    logger.info('Fetching agendas', { lastRunDate });
    const { data } = await this.axiosInstanceV4.get(
      `${ this.databaseV4.parliament }/KNS_Agenda?$filter=KnessetNum eq 25` +
        (lastRunDate ? ` and LastUpdatedDate gt datetime'${ lastRunDate }'` : '') +
        '&$expand=KNS_Status'
    );
    return this.accumulateData(data);
  }

  async getAgendasDocuments(agendaId: number) {
    logger.info('Fetching agendas documents',{  agendaId });
    const { data } = await this.axiosInstanceV4.get(
      `${ this.databaseV4.parliament }/KNS_DocumentAgenda?$filter=AgendaID eq ${ agendaId }`
    );

    return this.accumulateData(data);
  }
}

export default new KnessetService();
