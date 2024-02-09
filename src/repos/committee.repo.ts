import BaseRepo from "../abstracts/repo.abstract";
import CommitteeModel, { Committee } from "../models/committee.model";
import knessetApiService from "../services/knesset-api.service";
import _ from "lodash";
class CommitteeRepo extends BaseRepo<Committee> {
  typeEnum: Record<number,string> = {
    70: "knesset",
    71: "main",
    72: "special",
    73: "joint",
  };

  subTypeEnum: Record<number,string> = {
    991: "permanent",
    72: "special",
    993: "investigation",
  };

  constructor() {
    super(CommitteeModel);
  }

  async fetchCommitteesFromKnessetApi() {
    const mainCommitteesFromApi = await knessetApiService.getMainCommittees();
    const arrangedCommittees = await this.arrangeCommittees(mainCommitteesFromApi);
    await this.findOrCreateMany(arrangedCommittees);
    
    const subCommitteesFromApi = await knessetApiService.getSubCommittees();
    const arrangedSubCommittees = await this.arrangeCommittees(subCommitteesFromApi);
    await this.findOrCreateMany(arrangedSubCommittees);
  }

  async arrangeCommittees(committees: any[]) {
    for await (const committee of committees) {
      if (committee.ParentCommitteeID) {
        const parentCommittee = await this.findOne({
          originId: committee.ParentCommitteeID,
        });
        _.set(committee, "parentCommittee", parentCommittee?._id);
      }
    }

    return committees.map((committee: { Name: any; CommitteeID: any; Email: any; CommitteeTypeID: number; AdditionalTypeID: number; parentCommittee: any; KnessetNum: any; }) => ({
      name: committee.Name,
      originId: committee.CommitteeID,
      email: committee.Email,
      type: this.typeEnum[committee.CommitteeTypeID],
      subType: this.subTypeEnum[committee.AdditionalTypeID],
      parentCommittee: committee.parentCommittee,
      knessetNum: committee.KnessetNum,
    }));
  }

  async updateCommitteesMembers(persons: any) {
    const commetteesToPeson = [];
    for (const person of persons) {
      for (const committee of person.committees) {
        commetteesToPeson.push({
          committee: committee.committeeId,
          person: person._id,
        });
      }
    }
    for await (const committeeToPerson of commetteesToPeson) {
      await this.findAndUpdate(
        {
          _id: committeeToPerson.committee,
        },
        {
          $addToSet: { members: committeeToPerson.person },
        }
      );
    }
  }
}

export default new CommitteeRepo();
