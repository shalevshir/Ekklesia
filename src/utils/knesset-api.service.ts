import axios from "axios";
import _, { filter } from "lodash";
import { mapIdToRole } from "../types/roles.enum";
import { Person } from "../modules/person/person.model";
import logger from "./logger";

function wait(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

class KnessetService {
  baseKnessetUrl = "http://knesset.gov.il/Odata/";
  baseKnessetUrlV4 = "http://knesset.gov.il/OdataV4/";
  dataBases = {
    parliament: "ParliamentInfo.svc",
    votes: "Votes.svc",
    lobby: "Lobbyist.svc",
    mmm: "MMM.svc",
  };
  databaseV4 = {
    parliament: "ParliamentInfo",
    votes: "Votes",
    lobby: "Lobbyist",
    mmm: "MMM",
  };

  axiosInstance = axios.create({
    baseURL: this.baseKnessetUrl,
  });

  axiosInstanceV4 = axios.create({
    baseURL: this.baseKnessetUrlV4,
  });

  async getMks(): Promise<any[] | undefined>  {
    try{
      const { data } = await this.axiosInstance.get(
        `${this.baseKnessetUrlV4}ParliamentInfo/KNS_PersonToPosition?$filter=KnessetNum eq 25&$expand=KNS_Person`
      );
      if(!data.value){
        throw new Error("No persons found");
      }
      const persons = new Set();
      for(const position of data.value) {
        const personObj = position.KNS_Person;
        //find person on the set
        const existPerson = Array.from(persons).find((person: any) => person.Id === personObj.Id) as any;  
        if(existPerson) {
          existPerson.positions.push(position);
        } else {
          personObj.positions = [position];
          persons.add(personObj);
        }

      }
      return Array.from(persons);
    } catch(error) {
      throw error;
    }
    
  }

  async accumulateData(data: any) {
    const dataArray = data.value ? data.value : data;
    while (data["odata.nextLink"]) {
      const { data: nextData } = await this.axiosInstance.get(
        `${this.dataBases.parliament}/${data["odata.nextLink"]}`
      );
      data = nextData;
      const toPush = data.value ? data.value : data;
      dataArray.push(...toPush);
      await wait(1)
    }
    return dataArray;
  }

  mapMKs(mksArray: any[]) {
    return mksArray.map((mk) => ({
      originId: mk.PersonID,
      firstNameHeb: mk.FirstName,
      lastNameHeb: mk.LastName,
      email: mk.Email,
      gender: mk.GenderDesc === "זכר" ? "male" : "female",
      faction: mk.faction,
      roles: this.mapRoles(mk.roles),
      committees: mk.committees,
      minister: mk.minister,
    }));
  }

  mapRoles(kns_positions: any) {
    const roles = [...kns_positions].map((roleId) => ({
      title: mapIdToRole[roleId],
      isCurrent: true,
    }));
    return roles;
  }

  async getMainCommittees() {
    try {
      
      const { data } = await this.axiosInstance.get(
        `${this.dataBases.parliament}/KNS_Committee()?$filter=KnessetNum eq 25 and ParentCommitteeID eq null`
      );
        
      const committees = await this.accumulateData(data);

      return committees;
    } catch (error) {
      console.log(error);
    }
  }


  async getSubCommittees() {
    try {
      
      const { data } = await this.axiosInstance.get(
        `${this.dataBases.parliament}/KNS_Committee()?$filter=KnessetNum eq 25`
      );
        
      const committees = await this.accumulateData(data);

      return committees;
    } catch (error) {
      console.log(error);
    }
  }

  async getCommitteeSessions(committeeId: number) {
    try {
      const { data } = await this.axiosInstance.get(
        `${this.dataBases.parliament}/KNS_Committee(${committeeId})/KNS_CommitteeSessions`
      );
      return this.accumulateData(data);
    } catch (error) {
      console.log(error);
    }
  }

  async getCommitteeSessionTranscript(committeeSessionId: number) {
    try {
      const { data } = await this.axiosInstance.get(
        `${this.dataBases.parliament}/KNS_CommitteeSession(${committeeSessionId})/KNS_DocumentCommitteeSessions/?$filter=GroupTypeID eq 23`
      );
      return data.value;
    } catch (error) {
      console.log(error);
    }
  }

  async getQueries() {
    try {
      const { data } = await this.axiosInstanceV4.get(
        `${this.databaseV4.parliament}/KNS_Query?$filter=KnessetNum eq 25&$expand=KNS_GovMinistry`
      );
      return data.value;
    } catch (error) {
      console.log(error);
    }
  }

  async getQueriesDocuments(queryId: number) {
    try {
      const { data } = await this.axiosInstanceV4.get(
        `${this.databaseV4.parliament}/KNS_DocumentQuery?$filter=QueryID eq ${queryId}`
      );
      return this.accumulateData(data);
    } catch (error) {
      console.log(error);
    }
  }
  async getBills() {
    try {
      const { data } = await this.axiosInstance.get(
        `${this.dataBases.parliament}/KNS_Bill?$filter=KnessetNum eq 25&$expand=KNS_BillInitiators`
      );
      return this.accumulateData(data);
    } catch (error) {
      console.log(error);
    }
  }

  async getBillsLinks(billsIds: number[]) {
    const updateData = [];
    try{
      logger.info(`Getting bills links for ${billsIds.length} bills`);
      let billNumber = 1;
      for await (const billId of billsIds) {
        logger.info(`Getting bill #${billNumber} out of ${billsIds.length}`, billId)
        const { data } = await this.axiosInstance.get(
          `${this.dataBases.parliament}/KNS_DocumentBill?$filter=BillID eq ${billId}&$orderby=LastUpdatedDate desc`
        );
        const getLatest = (data: any): any =>{
          const first = _.first(data) as any
          if(first.GroupTypeID !==  17 || first.GroupTypeID) return first
          
          //remove government decisions documents
          return getLatest(data.slice(1))
        }
        
        const latest = getLatest(data.value)
        updateData.push({
          originId: billId,
          billLink: latest.FilePath
        });
        logger.info(`Got bill #${billNumber++} out of ${billsIds.length}`, billId)
        await wait(0.3);
      }
      return updateData;
    } catch(error) {
      logger.error("Error getting bills links", error);
      throw error;
    }
  }
}

export default new KnessetService();