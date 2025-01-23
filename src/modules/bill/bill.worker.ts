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
      const data = await billRepo.fetchBillsFromKnesset();
      logger.info('Fetching bills process finished');
      await run.success({ message: 'Fetch bills process finished', data });
      return true;
    } catch (error) {
      logger.error('Error in fetchBills', error);
      await run.fail(
        error as Error
      );
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

  async updateBillDocument(job: Job, done: DoneCallback) {
    const run = await runHistoryRepo.initiateRunHistory(Entities.BILL_DOCUMENT);
    try {
      logger.info({ message: 'Update bill document process started', jobId: job.id });
      done();
      const data = await billRepo.updateBillsDocumentsLinks();
      logger.info('Update bill document process finished', { data });
      await run.success({ message: 'Update bill document process finished', data });
      return true;
    } catch (error: any) {
      logger.error('Error in updateBillDocument', { error: error.message, stack: error.stack });
      await run.fail(error as Error);
    }
  }

  async updateBillsCategories(job: Job, done: DoneCallback) {
    try {
      done()
      logger.info('Update bills categories process started');
      await billRepo.updateBillsCategories();
      logger.info('Update bills categories process finished');
      return true;
    } catch (error) {
      logger.error('Error in updateBillsCategories', error);
      throw error;
    }
  }
}

export default new billWorker();
