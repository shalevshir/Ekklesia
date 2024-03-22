import { Job } from 'bull';
import logger from '../../utils/logger';
import personRepo from './person.repo';

class PersonWorker {
  async fetchPeople(job: Job, done: () => void) {
    try {
      logger.info({ message: 'Fetch people process started', jobId: job.id });
      done();
      await personRepo.fetchPeopleFromKnessetApi();
      logger.info('Fetching people process finished');
      return true;
    } catch (error) {
      logger.error('Error in fetchPeople', error);
      throw error;
    }
  }
}

export default new PersonWorker();
