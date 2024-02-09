import BaseRepo from "../abstracts/repo.abstract";
import PersonModel, { Person } from "../models/person.model";
import knessetApiService from "../services/knesset-api.service";
import committeeRepo from "./committee.repo";
import ministryRepo from "./ministry.repo";
import { mapIdToRole } from "../types/roles.enum";
class PersonRepo extends BaseRepo<Person> {
  constructor() {
    super(PersonModel);
  }

  async createPersonFromKnessetApi() {
    const persons = await knessetApiService.getMksNew();
    if(!persons) {
      throw new Error("No persons found");
    }
    const arrangedPersons = await this.arrangeMks(persons);
    await this.createMany(arrangedPersons);
  }

  async arrangeMks(persons: any[]) {
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
                committeeId: committee.doc._id,
                isChairman:
                  position.KNS_Position && position.KNS_Position.Description === 'יו"ר ועדה' ? true : false,
              });
              person.roles.add(position.KNS_Position.PositionID);
            } else if (position.GovMinistryName) {
          const ministry = await ministryRepo.findOrCreate({
            name: position.GovMinistryName,
            originId: position.GovMinistryID,
          });
          person.minister ? person.minister.push(ministry.doc._id) : (person.minister = [ministry.doc._id]);
        } else {
          person.roles.add(position.KNS_Position.PositionID);
        }
      }
    }
    return this.mapMKs(persons);
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

  mapRoles(positions: Set<number>) {
    const roles = [...positions].map((roleId) => ({
      title: mapIdToRole[roleId],
      isCurrent: true,
    }));
    return roles;
  }
}

export default new PersonRepo();
