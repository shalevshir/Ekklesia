import Queue from 'bull';
import queryWorker from './modules/query/query.worker';
import { connectDB } from './utils/db';
import logger from './utils/logger';
import billWorker from './modules/bill/bill.worker';
import committeeSessionWorker from './modules/committeeSession/committeeSession.worker';
import { envVars } from './utils/envVars';
import personWorker from './modules/person/person.worker';
import committeeWorker from './modules/committee/committee.worker';

const startWorker = async () => {
  await connectDB();

  const workerQueue = new Queue('workerQueue', envVars.REDISCLOUD_URL || 'redis://127.0.0.1:6379');
  // Person
  workerQueue.process('fetchPeople', personWorker.fetchPeople);

  // Committee
  workerQueue.process('fetchCommitteesFromKnessetApi', committeeWorker.fetchCommitteesFromKnessetApi);
  workerQueue.process('updateCommitteesMembers', committeeWorker.updateCommitteesMembers);

  // Query
  workerQueue.process('fetchQueries', queryWorker.fetchQueries);
  workerQueue.process('updateCategoriesByMinistry', queryWorker.updateCategoriesByMinistry);

  // Bill
  workerQueue.process('fetchBills', billWorker.fetchBills);
  workerQueue.process('updateBillsStages', billWorker.updateBillsStages);
  workerQueue.process('updateBillDocument', billWorker.updateBillDocument);

  // CommitteeSession
  workerQueue.process('updateCommitteeSessions', committeeSessionWorker.fetchCommitteesSessions);
  logger.info('Worker is running...');
};

startWorker().catch(logger.error);
