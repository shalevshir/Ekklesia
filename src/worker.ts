import queryWorker from './modules/query/query.worker';
import { connectDB } from './utils/db';
import logger from './utils/logger';
import billWorker from './modules/bill/bill.worker';
import committeeSessionWorker from './modules/committeeSession/committeeSession.worker';
import personWorker from './modules/person/person.worker';
import committeeWorker from './modules/committee/committee.worker';
import queueService from './utils/queue.service';

const startWorker = async () => {
  await connectDB();

  logger.error({ message: 'test error', test: 'data' });
  logger.error({ message: 'test error', test: 'data' });

  // Person
  queueService.process('fetchPeople', personWorker.fetchPeople);

  // Committee
  queueService.process('fetchCommittees', committeeWorker.fetchCommitteesFromKnessetApi);
  // queueService.process('updateCommitteesMembers', committeeWorker.updateCommitteesMembers);

  // Query
  queueService.process('fetchQueries', queryWorker.fetchQueries);

  // Bill
  queueService.process('fetchBills', billWorker.fetchBills);
  queueService.process('updateBillsStages', billWorker.updateBillsStages);
  queueService.process('updateBillDocument', billWorker.updateBillDocument);
  queueService.process('updateBillsCategories', billWorker.updateBillsCategories);

  // CommitteeSession
  queueService.process('updateCommitteeSessions', committeeSessionWorker.runFetchSessionsTask);
  queueService.process('updateCommittee', committeeSessionWorker.fetchCommitteesSessions);

  queueService.process('keepAwake', async () => {
    logger.info('Worker is awake');
  });
  logger.info('Worker is running...', { date: new Date() });
  logger.info({ message: 'Worker is running...', date: new Date() });
};

startWorker().catch(logger.error);
