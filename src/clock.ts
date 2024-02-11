import cron from 'node-cron';
import Queue from 'bull';

const workerQueue = new Queue('workerQueue', process.env.REDISCLOUD_URL || 'redis://127.0.0.1:6379');

// run fetchQueries job every day at 00:00
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Running fetchQueries job...');
        // await workerQueue.add('fetchQueries');
        // console.log('fetchQueries job added to queue');
    } catch (error) {
        console.log('Error in fetchQueries job:', error);
    }
});

workerQueue.on('error', (error) => {
    console.log('Queue error:', error);
});

console.log('Cron is running...');