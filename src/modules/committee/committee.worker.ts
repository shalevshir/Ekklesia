import { Job, DoneCallback } from 'bull';
import committeeRepo from './committee.repo';
import logger from '../../utils/logger';
import personRepo from '../person/person.repo';
import runHistoryRepo from '../runHistory/runHistory.repo';
import { Entities } from '../../types/entities.enum';


class CommitteeWorker {
  async fetchCommitteesFromKnessetApi(job: Job, done: DoneCallback) {
    const run = await runHistoryRepo.initiateRunHistory(Entities.COMMITTEE);
    try {
      logger.info({ message: 'Fetch committees process started', jobId: job.id });
      done();
      const data = await committeeRepo.fetchCommitteesFromKnessetApi();
      logger.info('Fetching committees process finished');
      run.success({ message: 'Fetch committees process finished', data });
      return true;
    } catch (error) {
      logger.error('Error in fetchCommitteesFromKnessetApi', error);
      run.fail(error as Error);
    }
  }

  async updateCommitteesMembers(job: Job, done: DoneCallback) {
    try {
      logger.info({ message: 'Update committees members process started', jobId: job.id });
      done();
      const persons = await personRepo.find({});
      await committeeRepo.updateCommitteesMembers(persons);
      logger.info('Update committees members process finished');
      return true;
    } catch (error) {
      logger.error('Error in updateCommitteesMembers', error);
    }
  }
};

export default new CommitteeWorker();
