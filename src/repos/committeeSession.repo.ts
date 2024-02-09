import { InstanceType } from "typegoose";
import BaseRepo from "../abstracts/repo.abstract";
import CommitteeSessionModel, { CommitteeSession } from "../models/committeeSession.model";
import knessetApiService from "../services/knesset-api.service";
import committeeRepo from "./committee.repo";
import _ from "lodash";

class CommitteeSessionsRepo extends BaseRepo<CommitteeSession> {
  constructor() {
    super(CommitteeSessionModel);
  }

  async fetchCommitteesSessions(committeeId: number) {
    const committeesSessions = await knessetApiService.getCommitteeSessions(
      committeeId
    );
    const arrangedCommitteesSessions = await this.arrangeCommitteesSessions(
      committeesSessions
    );

    await this.findOrCreateMany(arrangedCommitteesSessions);
  }

  async arrangeCommitteesSessions(committeesSessions: any[]) {
    for await (const committeeSession of committeesSessions) {
      const committee = await committeeRepo.findOne({
        originId: committeeSession.CommitteeID,
      });
      if(!committee) {
        console.log('committee not found', committeeSession.CommitteeID);
        continue;
      }
      _.set(committeeSession, "committee", committee._id);
    }

    return committeesSessions.map((committeeSession) => ({
      originId: committeeSession.CommitteeSessionID,
      committee: committeeSession.committee,
      date: committeeSession.StartDate,
      type: committeeSession.TypeDesc === "פתוחה" ? "open" : "tour",
      sessionUrl: committeeSession.SessionUrl,
      broadcastUrl: committeeSession.BroadcastUrl,
      status: committeeSession.StatusDesc,
      sessionNumber: committeeSession.Number,
    }));
  }

  async updateCommitteesSessions(committeeSession: InstanceType<CommitteeSession>) {
    if(!committeeSession?.originId) {
      console.log('committeeSession not found', committeeSession);
      throw new Error('committeeSession not found');
    }
    const committeeTranscript =
      await knessetApiService.getCommitteeSessionTranscript(
        committeeSession.originId
      );
    committeeSession.transcriptUrl = committeeTranscript;
    await committeeSession.save();
  }
}

export default new CommitteeSessionsRepo();
