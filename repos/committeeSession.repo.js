const BaseRepo = require("../abstracts/repo.abstract");
const CommitteeSession = require("../models/committeeSession.model");
const knessetApiService = require("../services/knesset-api.service");
const committeeRepo = require("./committee.repo");
const _ = require("lodash");

class CommitteeSessionsRepo extends BaseRepo {
  constructor() {
    super(CommitteeSession);
  }

  async fetchCommitteesSessions(committeeId) {
    const committeesSessions = await knessetApiService.getCommitteeSessions(
      committeeId
    );
    const arrangedCommitteesSessions = await this.arrangeCommitteesSessions(
      committeesSessions
    );

    await this.findOrCreateMany(arrangedCommitteesSessions);
  }

  async arrangeCommitteesSessions(committeesSessions) {
    for await (const committeeSession of committeesSessions) {
      const committee = await committeeRepo.findOne({
        originId: committeeSession.CommitteeID,
      });
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

  async updateCommitteesSessions(committeeSession) {
    const committeeTranscript =
      await knessetApiService.getCommitteeSessionTranscript(
        committeeSession.originId
      );
    committeeSession.transcriptUrl = committeeTranscript;
    await committeeSession.save();
  }
}

module.exports = new CommitteeSessionsRepo();
