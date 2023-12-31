const { ObjectId } = require("mongoose/lib/types");
const BaseRepo = require("../abstracts/repo.abstract");
const Person = require("../models/person.model");
const knessetApiService = require("../services/knesset-api.service");
const committeeRepo = require("./committee.repo");
const { mapIdToRole } = require("../types/roles.enum");

class PersonRepo extends BaseRepo {
  constructor() {
    super(Person);
  }

  async createPersonFromKnessetApi() {
    const persons = await knessetApiService.getKMs();
    const arrangedPersons = await this.arrangePersons(persons);
    await this.createMany(arrangedPersons);
  }

  async arrangePersons(persons) {
    for await (const person of persons) {
      person.committees = [];
      person.roles = new Set();
      for await (const position of person.positions) {
        if (position.CommitteeName) {
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
        } else if (position.GovMinistryName) {
          person.minister = {
            ministryName: position.GovMinistryName,
            originId: position.GovMinistryID,
          };
        } else {
          person.roles.add(position.KNS_Position.PositionID);
        }
      }
    }
    return this.mapMKs(persons);
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
}

module.exports = new PersonRepo();
