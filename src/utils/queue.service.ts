import Queue, { Queue as QueueType } from 'bull';
import { envVars } from './envVars';


class QueueService {
  workerQueue: QueueType;

  constructor() {
    this.workerQueue = new Queue('workerQueue', envVars.REDISCLOUD_URL || 'redis://127.0.0.1:6379', {
      limiter: {
        max: 2,
        duration: 60000
      }
    });
  }

  async process(name: string, callback: (job: Queue.Job, done: Queue.DoneCallback) => void) {
    await this.workerQueue.process(name, callback);
  }

  async add(name: string, data: any) {
    await this.workerQueue.add(name, data);
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
