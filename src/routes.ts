

import committeeRepo from "./repos/committee.repo";
import CommitteeSessionsRepo from "./repos/committeeSession.repo";
import queryRepo from "./repos/query.repo";
import personRepo from "./repos/person.repo";
import billRepo from "./repos/bill.repo";
import categoriesRepo from "./repos/category.repo";
import { Request, Response } from "express";

const wait = async (seconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  };
  

const fetchMks = async (req: Request, res: Response) => {
  await personRepo.createPersonFromKnessetApi();

  res.send("done");
};

const fetchCommittees = async (req: Request, res: Response) => {
  await committeeRepo.fetchCommitteesFromKnessetApi();

  res.send("done");
};

const updateCommitteesMembers = async (req: Request, res: Response) => {
  const persons = await personRepo.find({});
  await committeeRepo.updateCommitteesMembers(persons);
  res.send("done");
};

const fetchCommitteesSessions = async (req: Request, res: Response) => {
  const committees = await committeeRepo.find({});
  for await (const committee of committees) {
    await CommitteeSessionsRepo.fetchCommitteesSessions(committee.originId);
    await wait(0.3);
  }
  res.send("done");
};

const updateSessionsInCommittees = async (req: Request, res: Response) => {
  const committees = await committeeRepo.find({});
  const toPromise = [];
  for await (const committee of committees) {
    const sessions = await CommitteeSessionsRepo.find({
      committee: committee._id,
    });
    const sessionsIds = sessions.map((session) => session._id);
    committee.sessions = sessionsIds;
    toPromise.push(committee.save());
  }
  await Promise.all(toPromise);
  res.send("done");
};

const fetchQueries = async (req: Request, res: Response) => {
  await queryRepo.fetchQueriesFromKnesset();
  res.send("done");
};

const fetchBills = async (req: Request, res: Response) => {
  await billRepo.fetchBillsFromKnesset();
  res.send("done");
};

const updateBills = async (req: Request, res: Response) => {
  await billRepo.updateBillsFromKnesset();
  res.send("done");
};

const getCategories = async (req: Request, res: Response) => {
  const categories = await categoriesRepo.getAllCategories();
  res.send(categories);
};

const getSubCategories = async (req: Request, res: Response) => {
  const subCategories = await categoriesRepo.getSubCategories(req.params.categoryName);
  res.send(subCategories);
};

const getNextQuery = async (req: Request, res: Response) => {
  const query = await queryRepo.getNextQuery();
  res.send(query);
};

const addCategoryToQuery = async (req: Request, res: Response) => {  
  const query = await queryRepo.addCategoryToQuery(req.body.documentId, req.body.categories);
  res.send(query);
};

export default {
  fetchMks,
  fetchCommittees,
  updateCommitteesMembers,
  fetchCommitteesSessions,
  updateSessionsInCommittees,
  fetchQueries,
  fetchBills,
  updateBills,
  getCategories,
  getSubCategories,
  getNextQuery,
  addCategoryToQuery,
};