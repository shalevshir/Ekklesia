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
    transformRequest: [
      (data, headers) => {
        return data;
      },
    ],
  });
  async getKMs() {
    try {
      let { data } = await this.axiosInstance.get(
        `${this.dataBases.parliament}/KNS_Person?$filter=IsCurrent eq true`
      );
      const dataArray = data.value;
      while (data["odata.nextLink"]) {
        const { data: nextData } = await this.axiosInstance.get(
          `${this.dataBases.parliament}/${data["odata.nextLink"]}`
        );
        data = nextData;
        dataArray.push(...data.value);
      }
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
        person.committees = [];
        person.roles = new Set();
        for (const position of positions) {
          if (position.CommitteeName) {
            await this.findOrCreateCommittee(position, person);
          } else if (position.GovMinistryName) {
            person.minister = {
              ministryName: position.GovMinistryName,
              originId: position.GovMinistryID,
            };
          } else {
            person.roles.add(position.KNS_Position.PositionID);
          }
        }
        await wait(1);
      }

      const mappedMks = this.mapMKs(dataArray);
      return mappedMks;
    } catch (error) {
      console.log(error);
    }
  }

  async findOrCreateCommittee(position, person) {
    const committee = await committeeRepo.findOrCreate({
      name: position.CommitteeName,
      originId: position.CommitteeID,
    });
    person.committees.push({
      name: position.CommitteeName,
      committeeId: new ObjectId(committee.doc._id),
      isChairman:
        position.KNS_Position.Description === 'יו"ר ועדה' ? true : false,
    });
    person.roles.add(position.KNS_Position.PositionID);
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

  async getCommittees(committeesNames) {
    try {
      const committees = [];

      for (const committeesName of committeesNames) {
        const { data } = await this.axiosInstance.get(
          `${this.dataBases.parliament}/KNS_Committee()&$filter=Name eq '${committeesName}'`,
          {
            params: {
              $filter: `Name eq '${committeesName}'`,
            },
            paramsSerializer: (params) => {
              return `$filter=${params.filter}`;
            },
          }
        );
        committees.push(data.value[0]);
        await wait(1);
      }
      return this.mapCommittees(committees);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new KnessetService();
