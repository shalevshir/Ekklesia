import { prop, getModelForClass, modelOptions, DocumentType } from '@typegoose/typegoose';
import { Entities } from '../../types/entities.enum';
import { ObjectId } from 'mongoose';

export enum RunStatuses {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

@modelOptions({ schemaOptions: { timestamps: true, versionKey: false }, options: { allowMixed: 0 } })
export class RunHistory {
  @prop({ required: true, enum: Entities })
    type!: Entities;

  @prop({ required: true, enum: RunStatuses })
    status!: RunStatuses;

  @prop({ required: true })
    startTime!: Date;

  @prop()
    duration!: string;

  @prop()
    endTime!: Date;

  @prop()
    error?: string;

  @prop()
    log?: Record<string, any>;

  @prop()
    entityId?: ObjectId;

  async success(
    this: DocumentType<RunHistory>, log: Record<string, any>
  ) {
    const id = this._id;
    const endDate = new Date();
    const duration = String((endDate.getTime() - this.startTime.getTime()) / 1000);
    const updateData = {
      status: RunStatuses.SUCCESS,
      log,
      endTime: endDate,
      duration
    };
      // update the run history with the end time and duration
    await RunHistoryModel.findByIdAndUpdate(id, updateData);
  }

  async fail(this: DocumentType<RunHistory>, error: Error) {
    const id = this._id;
    const endDate = new Date();
    const duration = String((endDate.getTime() - this.startTime.getTime()) / 1000);
    const updateData = {
      status: RunStatuses.FAILED,
      error: error.message,
      log: { stack:error.stack },
      endTime: endDate,
      duration
    };
      // update the run history with the end time, duration, and error message
    await RunHistoryModel.findByIdAndUpdate(id, updateData);
  }
}

const RunHistoryModel = getModelForClass(RunHistory);
export default RunHistoryModel;
