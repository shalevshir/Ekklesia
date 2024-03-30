import cron from 'node-cron';
import Queue from 'bull';
import { envVars } from './utils/envVars';

const workerQueue = new Queue('workerQueue', envVars.REDISCLOUD_URL || 'redis://127.0.0.1:6379');

// run fetchQueries job every day at 00:00
// cron.schedule('0 0 * * *', async () => {
//   try {
//     console.log('Running fetchQueries job...');
//     // await workerQueue.add('fetchQueries');
//     // console.log('fetchQueries job added to queue');
//   } catch (error) {
//     console.log('Error in fetchQueries job:', error);
//   }
// });
// run keep awake job every 20 minutes only between 23:00 and 10:00
cron.schedule('*/20 23-10 * * *', async () => {
  try {
    console.log('Running keep awake job...');
    await workerQueue.add('keepAwake');
    console.log('keep awake job added to queue');
  } catch (error) {
    console.log('Error in keep awake job:', error);
  }
});

workerQueue.on('error', (error) => {
  console.log('Queue error:', error);
});

console.log('Cron is running...');
