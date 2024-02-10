import Queue from 'bull';

// Initialize your Bull queue with the Redis URL from the environment variable
const workerQueue = new Queue('workerQueue', process.env.REDISCLOUD_URL || 'redis://127.0.0.1:6379');

interface EmailJobData {
  email: string;
  subject: string;
  body: string;
}

// Processing jobs from the queue
workerQueue.process('test2',async (job) => {
  const { email, subject, body }: EmailJobData = job.data;

  try {
    console.log(`Sent email to ${email}`);
    return Promise.resolve();
  } catch (error) {
    console.error(`Failed to send email to ${email}`, error);
    return Promise.reject(error);
  }
});


console.log('Worker is running...');
