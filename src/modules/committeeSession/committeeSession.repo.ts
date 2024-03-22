import { DocumentType } from '@typegoose/typegoose';
import BaseRepo from '../../abstracts/repo.abstract';
import CommitteeSessionModel, { Attendee, AttendeeRole, CommitteeSession, SessionType } from './committeeSession.model';
import knessetApiService from '../../utils/knesset-api.service';
import { getFileAsText } from '../../utils/files.service';
import personRepo from '../person/person.repo';
import { Committee } from '../committee/committee.model';
import logger from '../../utils/logger';

class CommitteeSessionsRepo extends BaseRepo<CommitteeSession> {
  constructor() {
    super(CommitteeSessionModel);
  }

  async fetchCommitteesSessions(committee: DocumentType<Committee>) {
    logger.info('Fetching sessions for committee: ' + committee._id);
    const committeesSessions = await knessetApiService.getCommitteeSessions(
      committee.originId
    );
    logger.info( `Fetched ${ committeesSessions.length } sessions` );
    const arrangedCommitteesSessions = await this.arrangeCommitteesSessions(
      committee,
      committeesSessions
    );

    const res = await this.updateMany(arrangedCommitteesSessions, { upsert: true });
    const sessionIds = res.map((session) => session._id);
    logger.info(`Updated ${ sessionIds.length } sessions`);
    logger.info('Updating committee with sessions');
    committee.sessions = sessionIds;
    await committee.save();
  }

  async arrangeCommitteesSessions(
    committee: DocumentType<Committee>, committeesSessions: any[]
  ): Promise<CommitteeSession[]> {
    const sessionsToSave: CommitteeSession[] = [];
    const allMissingAttendees: any[] = [];
    for (const session of committeesSessions) {
      const mappedSession: Partial<CommitteeSession> = {};
      const transcript = await this.getTranscriptUrl(session.CommitteeSessionID);
      mappedSession.transcriptUrl = transcript;
      const attendees = await this.getAttendees(session.CommitteeSessionID) as any;
      if (attendees.attendees?.length) {
        mappedSession.attendees = attendees.attendees;
      }
      if (attendees.missingAttendees?.length) {
        logger.error('missingAttendees', { missing: attendees.missingAttendees, sessionId: session.CommitteeSessionID });
        allMissingAttendees.push(...attendees.missingAttendees.map((attendee: any) => ({
          ...attendee,
          session: session.CommitteeSessionID
        })));
      }
      mappedSession.committee = committee._id;
      mappedSession.originId = session.CommitteeSessionID;
      mappedSession.date = session.StartDate;
      mappedSession.type = session.TypeDesc === 'פתוחה' ? SessionType.Open : SessionType.Secret;
      mappedSession.sessionUrl = session.SessionUrl;
      mappedSession.broadcastUrl = session.BroadcastUrl;
      mappedSession.status = session.StatusDesc;
      mappedSession.sessionNumber = session.Number;
      sessionsToSave.push(mappedSession as CommitteeSession);
    }
    logger.info('missingAttendees', { missing: allMissingAttendees });
    return sessionsToSave;
  }

  async getTranscriptUrl(committeeSessionId: number) {
    if (!committeeSessionId) {
      console.log('committeeSession not found', committeeSessionId);
      throw new Error('committeeSession not found');
    }
    const committeeTranscript =
      await knessetApiService.getCommitteeSessionTranscript(
        committeeSessionId
      );
    return committeeTranscript?.length ? committeeTranscript[0].FilePath : '';
  }

  getAttendees = async (committeeSessionId: number) => {
    const transcriptObj = await knessetApiService.getCommitteeSessionTranscript(
      committeeSessionId
    );
    if (!transcriptObj?.length) {
      logger.error('transcript not found', committeeSessionId);
      return [];
    }
    const transcriptText = await getFileAsText(transcriptObj[0].FilePath) as string;
    const attendees = await this.parseTranscript(transcriptText);
    return attendees;
  };

  parseTranscript = async (transcript: string): Promise<{
    attendees: Attendee[];
    missingAttendees: (Attendee | {
        person: string;
        role: AttendeeRole;
    })[];
}> => {
    const attendees: Attendee[] = [];
    const missingAttendees: any[] = [];

    const text = transcript.split('נכחו')[1]?.split('מוזמנים')[0];
    const membersText = text.split('חברי הוועדה:')[1]?.split('חברי הכנסת')[0];
    const guestsMksText = text.split('חברי הכנסת:')[1]?.split('מוזמנים')[0];

    const membersLines = membersText?.split('\n\n');

    for (const line of membersLines || []) {
      if (line.includes('משתתפים') || line.includes('חבר הכנסת')) {
        break;
      }
      const role = line.includes('יו"ר') || line.includes('יושב-ראש') ? AttendeeRole.Chairman : AttendeeRole.Member;
      const attendee = await this.extractAttendeesFromLine(line, role);
      if (!attendee) {
        continue;
      }
      if (typeof attendee.person === 'string') {
        missingAttendees.push(attendee);
        continue;
      }
      attendees.push(attendee as Attendee);
    }
    const guestsMksLines = guestsMksText?.split('\n\n');
    for (const line of guestsMksLines || []) {
      const attendee = await this.extractAttendeesFromLine(line, AttendeeRole.Guest);
      if (!attendee) {
        continue;
      }
      if (typeof attendee.person === 'string') {
        missingAttendees.push(attendee);
        continue;
      }
      attendees.push(attendee as Attendee);
    }

    return { attendees, missingAttendees };
  };

  extractAttendeesFromLine = async (line: string, role: AttendeeRole) => {
    const words = line.split(' ');
    const noWords = words.length < 1;
    const isEmpty = words.every((word) => word === '');
    if (isEmpty || noWords) {
      return;
    }
    const firstName = words[0];
    const lastName = words[1];
    // if ( words[2] && !words[2].includes('–') && !words[2].includes('-')) {
    //   lastName += '.*' + words[2];
    // }

    const name = new RegExp(`^.*${ firstName }.*${ lastName }.*$`);
    // find in virtual name field
    const person = await personRepo.getPersonByFullNameHeb(name) as DocumentType<any>;

    if (!person) {
      logger.error('person not found', name);
      return {
        person: `${ firstName } ${ lastName }`,
        role
      };
    }

    const attendee = new Attendee();
    attendee.person = person._id;
    attendee.role = role;
    return attendee;
  };
}


export default new CommitteeSessionsRepo();
