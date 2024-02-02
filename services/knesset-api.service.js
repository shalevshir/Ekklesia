const { default: axios } = require("axios");
const _ = require("lodash");
const committeeRepo = require("../repos/committee.repo");
const { mapIdToRole } = require("../types/roles.enum");
const { ObjectId } = require("mongoose/lib/types");
function wait(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

class KnessetService {
  baseKnessetUrl = "http://knesset.gov.il/Odata/";
  dataBases = {
    parliament: "ParliamentInfo.svc",
    votes: "Votes.svc",
    lobby: "Lobbyist.svc",
    mmm: "MMM.svc",
  };

  axiosInstance = axios.create({
    baseURL: this.baseKnessetUrl,
  });

  async getKMs() {
    try {
      let { data } = await this.axiosInstance.get(
        `${this.dataBases.parliament}/KNS_Person?$filter= `
      );
      const dataArray = await this.accumulateData(data);

      const persons = [];
      for (const person of dataArray) {
        let isMinister = false
        const { data } = await this.axiosInstance.get(
          `${this.dataBases.parliament}/KNS_PersonToPosition()?$expand=KNS_Position,KNS_Person&$filter=PersonID eq ${person.PersonID} and IsCurrent eq true`
        );
        for(const position of data.value) {
          if(position.FactionName){
            _.set(person, "faction.displayName", position.FactionName);
            _.set(person, "faction.name", position.FactionName);
            _.set(person, "faction.originId", position.FactionID);
          }
          if(position.GovMinistryID){
            isMinister = true
          }
        }


        await wait(0.5);
        if(!person.faction && !isMinister) continue;
        const positions = data.value;
        _.set(person, "positions", positions);
        persons.push(person);
      }

      return persons;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async accumulateData(data) {
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

  mapMKs(mksArray) {
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

  mapRoles(kns_positions) {
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

  async getCommitteeSessions(committeeId) {
    try {
      const { data } = await this.axiosInstance.get(
        `${this.dataBases.parliament}/KNS_Committee(${committeeId})/KNS_CommitteeSessions`
      );
      return this.accumulateData(data);
    } catch (error) {
      console.log(error);
    }
  }

  async getCommitteeSessionTranscript(committeeSessionId) {
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
      const { data } = await this.axiosInstance.get(
        `${this.dataBases.parliament}/KNS_Query?$filter=KnessetNum eq 25&$expand=KNS_DocumentQueries,KNS_GovMinistry`
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

  async getBillsLinks(billsIds) {
    const updateData = [];
    try{
      for await (const billId of billsIds) {
        const { data } = await this.axiosInstance.get(
          `${this.dataBases.parliament}/KNS_DocumentBill?$filter=BillID eq ${billId}`
        );
        updateData.push({
          originId: billId,
          billLink: data.value && data.value.length ?
          _.last(data.value).FilePath: null,
        });
        await wait(0.5);
      }
      return updateData;
    } catch(error) {
      console.log(error)
    }
  }
}

module.exports = new KnessetService();
