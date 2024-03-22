import { Job, DoneCallback } from 'bull';
import committeeRepo from './committee.repo';
import logger from '../../utils/logger';
import personRepo from '../person/person.repo';


class CommitteeWorker {
  async fetchCommitteesFromKnessetApi(job: Job, done: DoneCallback) {
    try {
      logger.info({ message: 'Fetch committees process started', jobId: job.id });
      done();
      await committeeRepo.fetchCommitteesFromKnessetApi();
      logger.info('Fetching committees process finished');
      return true;
    } catch (error) {
      logger.error('Error in fetchCommitteesFromKnessetApi', error);
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
