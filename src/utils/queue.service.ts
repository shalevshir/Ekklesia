import Queue, { Queue as QueueType } from 'bull';
import { envVars } from './envVars';


class QueueService {
  workerQueue: QueueType;

  constructor() {
    this.workerQueue = new Queue('workerQueue', envVars.REDISCLOUD_URL || 'redis://127.0.0.1:6379', {
      settings:{
        stalledInterval: 900000,
      },
      limiter:{
        max: 1,
        duration: 1000
      }
    });
    this.workerQueue.on('error', (error) => {
      console.error('Queue error:', error);
    });
  }

  async process(name: string, callback: (job: Queue.Job, done: Queue.DoneCallback) => void) {
    await this.workerQueue.process(name, callback);
  }

  async add(name: string, data?: any, delay?:number) {
    await this.workerQueue.add(name, data, { delay });
  }

  async close() {
    await this.workerQueue.close();
  }

  async clean() {
    await this.workerQueue.clean(0, 'completed');
    await this.workerQueue.clean(0, 'failed');
  }

  async getJob(jobId: string) {
    return await this.workerQueue.getJob(jobId);
  }

  async getJobs() {
    return await this.workerQueue.getJobs([ 'active', 'completed', 'failed' ]);
  }
}


export default new QueueService();
