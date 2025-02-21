import queryRepo from './query.repo';
import logger from '../../utils/logger';
import { DoneCallback, Job } from 'bull';
import runHistoryRepo from '../runHistory/runHistory.repo';
import { Entities } from '../../types/entities.enum';


class queriesWorker {
  async fetchQueries(job: Job, done: DoneCallback) {
    const run = await runHistoryRepo.initiateRunHistory(Entities.QUERY);
    try {
      logger.info({ message: 'Fetch queries process started', jobId: job.id, runId: run.id });
      done();
      const data = await queryRepo.fetchQueriesFromKnesset();
      logger.info('Fetching queries process finished');
      await run.success({ message: 'Fetch queries process finished', data });
      return true;
    } catch (error) {
      logger.error('Error in fetchQueries', error);
      await run.fail(error as Error);
    }
  }

  async updateQueriesCategories(job: Job, done: DoneCallback) {
    try {
      done()
      logger.info('Update Queries categories process started');
      await queryRepo.updateQueriesCategories();
      logger.info('Update Queries categories process finished');
      return true;
    } catch (error) {
      logger.error('Error in updateQueriesCategories', error);
      throw error;
    }
  }
}

export default new queriesWorker();
