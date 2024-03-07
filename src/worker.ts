import Queue from 'bull';
import queryWorker from './modules/query/query.worker';
import { connectDB } from './utils/db';
import logger from './utils/logger';
import billWorker from './modules/bill/bill.worker';

const startWorker = async () => {
    await connectDB()
    
    const workerQueue = new Queue('workerQueue', process.env.REDISCLOUD_URL || 'redis://127.0.0.1:6379');
    workerQueue.process('fetchQueries', queryWorker.fetchQueries);
    workerQueue.process('updateCategoriesByMinistry', queryWorker.updateCategoriesByMinistry);

    workerQueue.process('fetchBills', billWorker.fetchBills);
    workerQueue.process('updateBillsStages', billWorker.updateBillsStages);
    workerQueue.process('updateBillDocument', billWorker.updateBillDocument);
    // workerQueue.process('updateBillsMainCategory', billWorker.updateBillsMainCategory);
    // workerQueue.process('embedBills', billWorker.embedBills);

    logger.info('Worker is running...');
};

startWorker().catch(logger.error)