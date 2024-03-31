import cron from 'node-cron';
import logger from './utils/logger';
import queueService from './utils/queue.service';


// run keep awake job every 20 minutes only between 00:00 and 08:00
cron.schedule('*/20 0-8 * * *', async () => {
  try {
    logger.info('Running keep awake job...');
    await queueService.add('keepAwake');
    logger.info('keep awake job added to queue');
  } catch (error) {
    logger.info('Error in keep awake job:', error);
  }
}, {
  scheduled: true,
  timezone: 'Asia/Jerusalem'
});
logger.info('Cron is running...');
