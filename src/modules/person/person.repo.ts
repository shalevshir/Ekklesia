import BaseRepo from "../../abstracts/repo.abstract";
import PersonModel, { Person } from "./person.model";
import knessetApiService from "../../utils/knesset-api.service";
import committeeRepo from "../committee/committee.repo";
import ministryRepo from "../ministry/ministry.repo";
import { mapIdToRole } from "../../types/roles.enum";
class PersonRepo extends BaseRepo<Person> {
  constructor() {
    super(PersonModel);
  }

  async createPersonFromKnessetApi() {
    const persons = await knessetApiService.getMks();
    if(!persons) {
      throw new Error("No persons found");
    }
    const arrangedPersons = await this.arrangeMks(persons);
    await this.updateMany(arrangedPersons, { upsert:true } );
  }

  async arrangeMks(persons: any[]) {
    for await (const person of persons) {
      const committees = []
      person.roles = new Set();
      for await (const position of person.positions) {
        // if (person.roles.has(position.PositionID)) {
        //   continue;
        // }
        if (position.CommitteeName) {
          const committee = await committeeRepo.findOrCreate({
            name: position.CommitteeName,
            originId: position.CommitteeID,
          });

          committees.push({
            name: position.CommitteeName,
            committeeId: committee.doc._id,
            isChairman:
              position.PositionID == 41? true : false,
          });
          person.roles.add(position.PositionID);
        } else if (position.GovMinistryName) {
          const ministry = await ministryRepo.findOrCreate({
            name: position.GovMinistryName,
            originId: position.GovMinistryID,
          });
          person.minister ? person.minister.push(ministry.doc._id) : (person.minister = [ministry.doc._id]);
        } else if(position.FactionName) {
          person.faction = {
            displayName: position.FactionName,
            name: position.FactionName,
            originId: position.FactionID,
          };
          person.roles.add(position.PositionID);
        } else {
            person.roles.add(position.PositionID);
        }
      }
      person.committees = committees;
    }
    return this.mapMKs(persons);
  }
  mapMKs(mksArray: any[]): Person[] {
    return mksArray.map((mk) => ({
      originId: mk.Id,
      firstNameHeb: mk.FirstName,
      lastNameHeb: mk.LastName,
      email: mk.Email,
      gender: mk.GenderDesc === "זכר" ? "male" : "female",
      faction: mk.faction,
      roles: this.mapRoles(mk.roles),
      committees: mk.committees,
      minister: mk.minister,
    } as Person));
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
