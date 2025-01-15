import { DoneCallback, Job } from 'bull';
import logger from '../../utils/logger';
import agendaRepo from './agenda.repo';
import runHistoryRepo from '../runHistory/runHistory.repo';
import { Entities } from '../../types/entities.enum';

class AgendaWorker {
  async fetchAgendas(job: Job, done: DoneCallback) {
    const run = await runHistoryRepo.initiateRunHistory(Entities.AGENDA);
    try {
      logger.info({ message: 'Fetch agendas process started', jobId: job.id });
      done();
      const data = await agendaRepo.fetchAgendasFromKnesset();
      logger.info('Fetching agendas process finished');
      await run.success({ message: 'Fetch agendas process finished', data });
      return true;
    } catch (error) {
      logger.error('Error in fetchAgendas', error);
      await run.fail(error as Error);
    }
  }
  
}

export default new AgendaWorker();
