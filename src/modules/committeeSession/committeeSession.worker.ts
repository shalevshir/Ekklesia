import { DoneCallback, Job } from 'bull';
import logger from '../../utils/logger';
import committeeRepo from '../committee/committee.repo';
import { Entities } from '../../types/entities.enum';
import runHistoryRepo from '../runHistory/runHistory.repo';
import committeeSessionRepo from './committeeSession.repo';
import queueService from '../../utils/queue.service';

class CommitteeSessionWorker {
  async runFetchSessionsTask(job: Job, done: DoneCallback) {
    try {
      logger.info({ message: 'Run fetch sessions job', jobId: job.id });
      done();
      const committees = await committeeRepo.find({});
      for (const committee of committees) {
        logger.info({ message: 'Running fetching committee sessions', committeeId: committee._id });
        queueService.add('updateCommittee', { data: committee });
      }
      logger.info('Fetching committees sessions process finished');
      return true;
    } catch (error) {
      logger.error('Error in fetchCommitteesSessions', error);
      throw error;
    }
  }

  async fetchCommitteesSessions(job: Job, done: DoneCallback) {
    const committee = job.data?.data;
    const run = await runHistoryRepo.initiateRunHistory(Entities.COMMITTEE_SESSION, committee._id);
    try {
      logger.info({ message: 'Fetch committees sessions process started', jobId: job.id });
      const data = await committeeSessionRepo.fetchCommitteesSessions(job.data?.data, run);
      logger.info('Fetching committees sessions process finished');
      run.success({ message: 'Fetch committees sessions process finished', data });
      done();
      return true;
    } catch (error) {
      logger.error('Error in fetchCommitteesSessions', error);
      run.fail(error as Error);
    }
  }
}

export default new CommitteeSessionWorker();
