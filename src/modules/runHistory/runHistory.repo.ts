import RunHistoryModel, { RunHistory, RunStatuses } from './runHistory.model';
import logger from '../../utils/logger';
import BaseRepo from '../../abstracts/repo.abstract';
import { DocumentType } from '@typegoose/typegoose';
import { Entities } from '../../types/entities.enum';
import { ObjectId } from 'mongoose';

class RunHistoryRepo extends BaseRepo<RunHistory> {
  constructor() {
    super(RunHistoryModel);
  }
  async initiateRunHistory(type: Entities, entityId?: ObjectId): Promise<DocumentType<RunHistory>> {
    try {
      const runHistory = new RunHistoryModel({
        type,
        status: RunStatuses.PENDING,
        startTime: new Date(),
        entityId
      });

      const run = await runHistory.save();
      logger.info({ message: 'Run history initiated', run });
      return run;
    } catch (error) {
      logger.error('Error in initiateRunHistory', error);
      throw error;
    }
  }

  async createRunHistory(
    type: string, status: string, startTime: Date, endTime: Date, error?: string
  ) {
    try {
      const duration = String((endTime.getTime() - startTime.getTime()) / 1000);
      const runHistory = new RunHistoryModel({
        type,
        status,
        duration,
        startTime,
        endTime,
        error
      });

      await runHistory.save();

      logger.info(`Run history created: ${ type } - ${ status }`);
    } catch (error) {
      logger.error('Error in createRunHistory', error);
    }
  }

  async getLatestRunDate(type: Entities, entityId?: ObjectId): Promise<string | null> {
    const lastRun = await RunHistoryModel.findOne(
      { type, status: RunStatuses.SUCCESS, entityId }, { startTime: 1 }).sort({ startTime: -1 }
    );
    if (!lastRun) {
      return null;
    }
    return lastRun.startTime.toISOString();
  }

  async isTaskRunning(type: Entities, entityId?: ObjectId): Promise<boolean> {
    const run = await RunHistoryModel.findOne({ entityId, type, status: RunStatuses.PENDING });
    return run ? true : false;
  }
}

export default new RunHistoryRepo();
