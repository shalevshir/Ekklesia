import { prop, getModelForClass, modelOptions, DocumentType } from '@typegoose/typegoose';

export enum RunTypes {
  PERSON = 'person',
  COMMITTEE = 'committee',
  COMMITTEE_SESSION = 'committeeSession',
  BILL = 'bill',
  QUERY = 'query',
  AGENDA = 'agenda',
}

export enum RunStatuses {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

@modelOptions({ schemaOptions: { timestamps: true, versionKey: false } })
export class RunHistory {
  @prop({ required: true, enum: RunTypes })
    type!: RunTypes;

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


  async endRun(
    this: DocumentType<RunHistory>, data: { status: RunStatuses; log: Record<string, any>; error?: string }
  ) {
    const id = this._id;
    const endDate = new Date();
    const duration = String((endDate.getTime() - this.startTime.getTime()) / 1000);
    const updateData = {
      ...data,
      endTime: endDate,
      duration
    };
      // update the run history with the end time and duration
    await RunHistoryModel.findByIdAndUpdate(id, updateData);
  }
}

const RunHistoryModel = getModelForClass(RunHistory);
export default RunHistoryModel;
