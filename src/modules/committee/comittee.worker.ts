import { Job, DoneCallback } from 'bull';
import committeeRepo from './committee.repo';
import logger from '../../utils/logger';


class CommitteeWorker {
  async fetchCommitteesFromKnessetApi(job: Job, done: DoneCallback) {
    try {
      logger.info({ message: 'Fetch committees process started', jobId: job.id });
      done();
      await committeeRepo.fetchCommitteesFromKnessetApi();
      logger.info('Fetching committees process finished');
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default new CommitteeWorker();
