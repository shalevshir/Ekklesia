import committeeSessionRepo from './committeeSession.repo';
import { DoneCallback, Job } from 'bull';
import logger from '../../utils/logger';
import committeeRepo from '../committee/committee.repo';

class CommitteeSessionWorker {
  async fetchCommitteesSessions(job: Job, done: DoneCallback) {
    try {
      logger.info({ message: 'Fetch committees sessions process started', jobId: job.id });
      done();
      const committees = await committeeRepo.find({});
      for (const committee of committees) {
        logger.info({ message: 'Fetching sessions for committee', committeeId: committee._id });
        await committeeSessionRepo.fetchCommitteesSessions(committee);
        logger.info({ message: 'Fetched sessions for committee', committeeId: committee._id });
      }
      logger.info('Fetching committees sessions process finished');
      return true;
    } catch (error) {
      logger.error('Error in fetchCommitteesSessions', error);
      throw error;
    }
  }
}

export default new CommitteeSessionWorker();
