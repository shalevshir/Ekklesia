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
        `${this.dataBases.parliament}/KNS_Person?$filter=IsCurrent eq true`
      );
      const dataArray = await this.accumulateData(data);

      const persons = [];
      for (const person of dataArray) {
        const { data } = await this.axiosInstance.get(
          `${this.dataBases.parliament}/KNS_PersonToPosition()?$expand=KNS_Position,KNS_Person&$filter=PersonID eq ${person.PersonID} and IsCurrent eq true`
        );

        if (data.value[0].FactionName) {
          _.set(person, "faction.displayName", data.value[0].FactionName);
          _.set(person, "faction.name", data.value[0].FactionName);
          _.set(person, "faction.originId", data.value[0].FactionID);
        }

        const positions = data.value;
        _.set(person, "positions", positions);

        persons.push(person);

        await wait(0.5);
      }

      return persons;
    } catch (error) {
      console.log(error);
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

  async getCommittees(committeeIds) {
    try {
      const committees = [];

      for await (const committeeId of committeeIds) {
        const { data } = await this.axiosInstance.get(
          `${this.dataBases.parliament}/KNS_Committee(${committeeId})`
        );
        committees.push(data);
        await wait(0.5);
      }
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
}

module.exports = new KnessetService();
