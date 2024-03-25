import BaseRepo from '../../abstracts/repo.abstract';
import PersonModel, { Person } from './person.model';
import knessetApiService from '../../utils/knesset-api.service';
import committeeRepo from '../committee/committee.repo';
import ministryRepo from '../ministry/ministry.repo';
import { mapIdToRole } from '../../types/roles.enum';
import logger from '../../utils/logger';
import { DocumentType } from '@typegoose/typegoose';
import { RunHistory, RunStatuses } from '../runHistory/runHistory.model';

class PersonRepo extends BaseRepo<Person> {
  private _peopleList: Person[] = [];
  private _lastFetch: Date = new Date(0);
  private readonly _fetchInterval = 1000 * 60 * 60 * 24;

  constructor() {
    super(PersonModel);
  }
  public get peopleList() {
    // if the last fetch was more than 24 hours ago, reset the list
    if (this._lastFetch.getTime() + this._fetchInterval < new Date().getTime()) {
      this._peopleList = [];
    }

    if (this._peopleList.length === 0) {
      return this.find({}).then((people) => {
        this._peopleList = people;
        this._lastFetch = new Date();
        return people;
      });
    }
    return this._peopleList;
  }

  async fetchPeopleFromKnessetApi(run: DocumentType<RunHistory>) {
    const people = await knessetApiService.getMks();
    logger.info(`Found ${ people?.length } People`);
    if (!people) {
      throw new Error('No People found');
    }
    const arrangedPeople = await this.arrangeMks(people);
    const updated = await this.updateMany(arrangedPeople, { upsert: true });
    const peopleIds = updated.map((doc) => doc._id);
    run.endRun(
      { status: RunStatuses.SUCCESS, log: { message: `${ updated.length } People fetched successfully`, peopleIds } }
    );
  }

  async arrangeMks(people: any[]) {
    for (const person of people) {
      logger.info({ message: 'Arranging person', person });
      const committees = new Set();
      person.roles = new Set();
      for (const position of person.positions) {
        person.roles.add(position.PositionID);
        if (position.CommitteeName) {
          // eslint-disable-next-line no-await-in-loop
          const committee = await committeeRepo.findOrCreate({
            originId: position.CommitteeID
          }, {
            name: position.CommitteeName,
            originId: position.CommitteeID
          });
          if (committee.created) {
            logger.info('Created committee', committee.doc._id);
          }

          committees.add({
            name: position.CommitteeName,
            committeeId: committee.doc._id,
            isChairman:
              position.PositionID == 41 ? true : false
          });
        } else if (position.GovMinistryName) {
          // eslint-disable-next-line no-await-in-loop
          const ministry = await ministryRepo.findOrCreate({
            originId: position.GovMinistryID
          }, {
            name: position.GovMinistryName,
            originId: position.GovMinistryID
          });
          if (ministry.created) {
            logger.info('Created ministry', ministry.doc._id);
          }
          person.minister ? person.minister.push(ministry.doc._id) : (person.minister = [ ministry.doc._id ]);
        } else if (position.FactionName) {
          person.faction = {
            displayName: position.FactionName,
            name: position.FactionName,
            originId: position.FactionID
          };
        }
      }
      person.committees = committees;
      logger.info({ message: 'Person arranged', person });
    }
    return this.mapMKs(people);
  }
  mapMKs(mksArray: any[]): Person[] {
    return mksArray.map((mk) => ({
      originId: mk.Id,
      firstNameHeb: mk.FirstName,
      lastNameHeb: mk.LastName,
      email: mk.Email,
      gender: mk.GenderDesc === 'זכר' ? 'male' : 'female',
      faction: mk.faction,
      roles: this.mapRoles(mk.roles),
      committees: Array.from(mk.committees),
      minister: mk.minister ? mk.minister : []
    } as Person));
  }

  mapRoles(positions: Set<number>) {
    const roles = [ ...positions ].map((roleId) => ({
      title: mapIdToRole[roleId],
      isCurrent: true,
      roleOriginId: roleId
    }));
    return roles;
  }

  async getPersonByOriginId(originId: number) {
    return (await this.peopleList).find((person) => person.originId === originId);
  }

  async getPersonByFullNameHeb(name: string| RegExp): Promise<DocumentType<any>> {
    return (await this.peopleList).find((person) => {
      const personName = `${ person.firstNameHeb } ${ person.lastNameHeb }`;
      // check if regex matches the name
      return name instanceof RegExp ? name.test(personName) : personName.includes(name);
    });
  }
}

export default new PersonRepo();
