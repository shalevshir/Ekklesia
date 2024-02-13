import Queue from 'bull';
import queryRepo from './modules/query/query.repo';
import queryWorker from './modules/query/query.worker';

// Initialize your Bull queue with the Redis URL from the environment variable
const workerQueue = new Queue('workerQueue', process.env.REDISCLOUD_URL || 'redis://127.0.0.1:6379');

// Processing jobs from the queue
workerQueue.process('fetchQueries', queryWorker.fetchQueries);



console.log('Worker is running...');
