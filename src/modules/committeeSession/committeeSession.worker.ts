import { DoneCallback, Job } from 'bull';
import logger from '../../utils/logger';
import committeeRepo from '../committee/committee.repo';
import { Entities } from '../../types/entities.enum';
import runHistoryRepo from '../runHistory/runHistory.repo';
import committeeSessionRepo from './committeeSession.repo';
import queueService from '../../utils/queue.service';
import { DocumentType } from '@typegoose/typegoose';
import { Committee } from '../committee/committee.model';

const wait = (sec: number) => new Promise(resolve => setTimeout(resolve, sec * 1000));
class CommitteeSessionWorker {
  async runFetchSessionsTask(job: Job, done: DoneCallback) {
    try {
      logger.info({ message: 'Run fetch sessions job', jobId: job.id });
      done();
      // const todaysRuns = await runHistoryRepo.getTodayRuns(Entities.COMMITTEE_SESSION);
      // const committeesToExclude = todaysRuns.map(run => run.entityId);
      const committees = await committeeRepo.find({});
      
      for (const committee of committees) {
        logger.info({ message: 'Running fetching committee sessions', committeeId: committee._id });
        queueService.add('updateCommittee', { committeeId: committee._id });
        await wait(120);
      }
      logger.info('Fetching committees sessions process finished');
      return true;
    } catch (error) {
      logger.error('Error in fetchCommitteesSessions', error);
    }
  }

  async fetchCommitteesSessions(job: Job, done: DoneCallback) {
    const committeeId = job.data?.committeeId;
    const isTaskRunning = await runHistoryRepo.isTaskRunning(Entities.COMMITTEE_SESSION, committeeId );
    if (isTaskRunning) {
      logger.info('Task is already running', { committeeId, jobId: job.id });
      return
    }
    const run = await runHistoryRepo.initiateRunHistory(Entities.COMMITTEE_SESSION, committeeId);
    try { 
      const committee = await committeeRepo.model.findById(committeeId) as DocumentType<Committee>;
      logger.info({ message: 'Fetch committees sessions process started', jobId: job.id, committeeId: committeeId });
      const data = await committeeSessionRepo.fetchCommitteesSessions(committee, run?.entityId);
      logger.info('Fetching committees sessions process finished');
      await run.success({ message: 'Fetch committees sessions process finished', data });
      done();
      return true;
    } catch (error) {
      logger.error('Error in fetchCommitteesSessions', error);
      await run.fail(error as Error);
    }
  }
}

export default new CommitteeSessionWorker();
