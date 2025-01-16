import queryWorker from './modules/query/query.worker';
import { connectDB } from './utils/db';
import logger from './utils/logger';
import billWorker from './modules/bill/bill.worker';
import committeeSessionWorker from './modules/committeeSession/committeeSession.worker';
import personWorker from './modules/person/person.worker';
import committeeWorker from './modules/committee/committee.worker';
import queueService from './utils/queue.service';
import agendaWorker from './modules/agenda/agenda.worker';

const startWorker = async () => {
  await connectDB();
  // Person
  queueService.process('fetchPeople', personWorker.fetchPeople);

  // Committee
  queueService.process('fetchCommittees', committeeWorker.fetchCommitteesFromKnessetApi);
  queueService.process('updateCommitteesMembers', committeeWorker.updateCommitteesMembers);

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

  // Agenda
  queueService.process('fetchAgendas', agendaWorker.fetchAgendas);

  queueService.process('keepAwake', async () => {
    logger.info('Worker is awake');
  });
  logger.info('Worker is running...');
};

startWorker().catch(logger.error);
