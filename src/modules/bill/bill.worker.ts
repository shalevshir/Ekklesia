import { DoneCallback, Job } from 'bull';
import logger from '../../utils/logger';
import committeeRepo from '../committee/committee.repo';
import billRepo from './bill.repo';
import runHistoryRepo from '../runHistory/runHistory.repo';
import { Entities } from '../../types/entities.enum';


class billWorker {
  async fetchBills(job: Job, done: DoneCallback) {
    const run = await runHistoryRepo.initiateRunHistory(Entities.BILL);
    try {
      logger.info({ message: 'Fetch bills process started', jobId: job.id });
      done();
      await billRepo.fetchBillsFromKnesset(run);
      logger.info('Fetching bills process finished');
      return true;
    } catch (error) {
      logger.error('Error in fetchBills', error);
      run.fail(
        error as Error
      );
      throw error;
    }
  }


  async updateBillsMainCategory(job: any) {
    try {
      logger.info({ message: 'Update bills main category process started', jobId: job.id });
      const bills = await billRepo.find({});
      for (const bill of bills) {
        if (!bill.committee) {
          continue;
        }
        const category = committeeRepo.categoryByCommitteeId(bill.committee.toString());
        if (!category) {
          continue;
        }
        await billRepo.update({ _id: bill._id }, { categories: [ category ] });
      }
      logger.info('Update bills main category process finished');
      return true;
    } catch (error) {
      logger.error('Error in updateBillsMainCategory', error);
      throw error;
    }
  }

  async updateBillsStages(job: any) {
    logger.info({ message: 'Update bill stages process started', jobId: job.id });
    await billRepo.updateBillsStages();
    logger.info('Update bill stages process finished');
    return true;
  }

  async updateBillDocument(job: any) {
    logger.info({ message: 'Update bill document process started', jobId: job.id });
    await billRepo.updateBillsDocumentsLinks();
    logger.info('Update bill document process finished');
    return true;
  }
}

export default new billWorker();
