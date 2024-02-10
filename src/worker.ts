import Queue from 'bull';
import queryRepo from './repos/query.repo';

// Initialize your Bull queue with the Redis URL from the environment variable
const workerQueue = new Queue('workerQueue', process.env.REDISCLOUD_URL || 'redis://127.0.0.1:6379');

interface EmailJobData {
  email: string;
  subject: string;
  body: string;
}

// Processing jobs from the queue
workerQueue.process('fetchQueries',async (job) => {
  try{
    await queryRepo.fetchQueriesFromKnesset();
    return 'done'
  }catch(error){
    throw error;
  }

});


console.log('Worker is running...');
