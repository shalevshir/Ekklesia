import { ObjectId } from 'mongoose';
import axios from 'axios';
import _ from 'lodash';
import logger from './logger';
import runHistoryRepo from '../modules/runHistory/runHistory.repo';
import { Entities } from '../types/entities.enum';

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
      `${ this.baseKnessetUrlV4 }ParliamentInfo/KNS_PersonToPosition?$filter=KnessetNum eq 25` +
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

  async getQueries() {
    const lastRunDate = await runHistoryRepo.getLatestRunDate(Entities.QUERY);
    logger.info('Fetching queries', { lastRunDate });
    const { data } = await this.axiosInstanceV4.get(
      `${ this.databaseV4.parliament }/KNS_Query?$expand=KNS_GovMinistry&$filter=KnessetNum eq 25` +
        (lastRunDate ? ` and LastUpdatedDate gt ${ lastRunDate }` : '')
    );
    return data.value;
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

  async getBillsLinks(billsIds: number[]) {
    const updateData = [];
    logger.info(`Getting bills links for ${ billsIds.length } bills`);
    let billNumber = 1;
    for await (const billId of billsIds) {
      logger.info(`Getting bill #${ billNumber } out of ${ billsIds.length }`, billId);
      const { data } = await this.axiosInstance.get(
        `${ this.dataBases.parliament }/KNS_DocumentBill?$filter=BillID eq ${ billId }&$orderby=LastUpdatedDate desc`
      );
      const getLatest = (data: any): any => {
        const first = _.first(data) as any;
        if (first.GroupTypeID !== 17 || first.GroupTypeID) return first;

        // remove government decisions documents
        return getLatest(data.slice(1));
      };

      const latest = getLatest(data.value);
      updateData.push({
        originId: billId,
        billLink: latest.FilePath
      });
      logger.info(`Got bill #${ billNumber++ } out of ${ billsIds.length }`, billId);
      await wait(0.3);
    }
    return updateData;
  }
}

export default new KnessetService();
