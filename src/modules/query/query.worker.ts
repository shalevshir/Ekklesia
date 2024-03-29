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
      run.success({ message: 'Fetch queries process finished', data });
      return true;
    } catch (error) {
      logger.error('Error in fetchQueries', error);
      run.fail(error as Error);
      throw error;
    }
  }

  async updateCategoriesByMinistry(job: any) {
    try {
      logger.info({ message: 'Update categories by ministry process started', jobId: job.id });
      await queryRepo.updateCategoriesByMinistry();
      logger.info('Update categories by ministry process finished');
      return true;
    } catch (error) {
      logger.error('Error in update categories by ministry', error);
      throw error;
    }
  };
}

export default new queriesWorker();
