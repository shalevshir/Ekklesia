import queryRepo from './query.repo';
import logger from '../../utils/logger';
import { DoneCallback, Job } from 'bull';


class queriesWorker {
  async fetchQueries(job: Job, done: DoneCallback) {
    try {
      logger.info({ message: 'Fetch queries process started', jobId: job.id });
      done();
      await queryRepo.fetchQueriesFromKnesset();
      logger.info('Fetching queries process finished');
      return true;
    } catch (error) {
      logger.error('Error in fetchQueries', error);
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
