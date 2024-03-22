

import committeeRepo from './modules/committee/committee.repo';
import CommitteeSessionsRepo from './modules/committeeSession/committeeSession.repo';
import personRepo from './modules/person/person.repo';
import billRepo from './modules/bill/bill.repo';
import { Request, Response } from 'express';

import Queue from 'bull';
import { envVars } from './utils/envVars';

const workerQueue = new Queue('workerQueue', envVars.REDISCLOUD_URL || 'redis://127.0.0.1:6379');

const wait = async (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};


const fetchMks = async (req: Request, res: Response) => {
  try {
    await personRepo.createPersonFromKnessetApi();

    res.send('done');
  } catch (error: any) {
    console.log(error);
    res.status(500).send({ title: 'Error in fetchMks', message: error.message });
  }
};

const fetchCommittees = async (req: Request, res: Response) => {
  await committeeRepo.fetchCommitteesFromKnessetApi();

  res.send('done');
};

const updateCommitteesMembers = async (req: Request, res: Response) => {
  const persons = await personRepo.find({});
  await committeeRepo.updateCommitteesMembers(persons);
  res.send('done');
};

const fetchCommitteesSessions = async (req: Request, res: Response) => {
  const committees = await committeeRepo.find({});
  const toPromise = [];
  for (const committee of committees) {
    toPromise.push(CommitteeSessionsRepo.fetchCommitteesSessions(committee));
    await wait(0.3);
  }
  res.send('done');
};

const updateSessionsInCommittees = async (req: Request, res: Response) => {
  const committees = await committeeRepo.find({});
  const toPromise = [];
  for await (const committee of committees) {
    const sessions = await CommitteeSessionsRepo.find({
      committee: committee._id
    });
    const sessionsIds = sessions.map((session) => session._id);
    committee.sessions = sessionsIds;
    toPromise.push(committee.save());
  }
  await Promise.all(toPromise);
  res.send('done');
};

const fetchQueries = async (req: Request, res: Response) => {
  await workerQueue.add('fetchQueries');
  res.send('Job sent to worker queue.');
};

const fetchBills = async (req: Request, res: Response) => {
  await billRepo.fetchBillsFromKnesset();
  res.send('done');
};

const updateBills = async (req: Request, res: Response) => {
  await billRepo.updateBillsFromKnesset();
  res.send('done');
};

export default {
  fetchMks,
  fetchCommittees,
  updateCommitteesMembers,
  fetchCommitteesSessions,
  updateSessionsInCommittees,
  fetchQueries,
  fetchBills,
  updateBills
};
