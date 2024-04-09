import { DoneCallback, Job } from 'bull';
import logger from '../../utils/logger';
import personRepo from './person.repo';
import runHistoryRepo from '../runHistory/runHistory.repo';
import { Entities } from '../../types/entities.enum';

class PersonWorker {
  async fetchPeople(job: Job, done: DoneCallback) {
    const run = await runHistoryRepo.initiateRunHistory(Entities.PERSON);
    try {
      logger.info({ message: 'Fetch people process started', jobId: job.id, runId: run._id });
      done();
      const peopleIds = await personRepo.fetchPeopleFromKnessetApi();
      logger.info('Fetching people process finished');
      await run.success( { message: `Fetched ${ peopleIds.length } people`, peopleIds });
      return true;
    } catch (error) {
      logger.error('Error in fetchPeople', error);
      await run.fail(
        error as Error
      );
    }
  }

  async updatePeopleFulName() {
    const people = await personRepo.find({});
    const toPromise = people.map(async (person) => {
      const fullName = `${ person.firstNameHeb } ${ person.lastNameHeb }`;
      return personRepo.update({ _id: person._id }, { fullName });
    });
    await Promise.all(toPromise);
  }
}

export default new PersonWorker();
