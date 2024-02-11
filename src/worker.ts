import Queue from 'bull';
import queryRepo from './repos/query.repo';
import workerModule from './modules.ts/worker.module';

// Initialize your Bull queue with the Redis URL from the environment variable
const workerQueue = new Queue('workerQueue', process.env.REDISCLOUD_URL || 'redis://127.0.0.1:6379');

// Processing jobs from the queue
workerQueue.process('fetchQueries', workerModule.fetchQueries);



console.log('Worker is running...');
