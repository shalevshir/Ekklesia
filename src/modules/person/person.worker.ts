import { RunStatuses, RunTypes } from './../runHistory/runHistory.model';
import { DoneCallback, Job } from 'bull';
import logger from '../../utils/logger';
import personRepo from './person.repo';
import runHistoryRepo from '../runHistory/runHistory.repo';

class PersonWorker {
  async fetchPeople(job: Job, done: DoneCallback) {
    const run = await runHistoryRepo.initiateRunHistory(RunTypes.PERSON);
    try {
      logger.info({ message: 'Fetch people process started', jobId: job.id });
      done();
      await personRepo.fetchPeopleFromKnessetApi(run);
      logger.info('Fetching people process finished');
      return true;
    } catch (error) {
      logger.error('Error in fetchPeople', error);
      run.endRun(
        { status: RunStatuses.FAILED, log: { message: 'Error in fetchPeople' }, error: (error as Error).message }
      );
    }
  }
}

export default new PersonWorker();
