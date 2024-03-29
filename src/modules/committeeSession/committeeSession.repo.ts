import { DocumentType } from '@typegoose/typegoose';
import BaseRepo from '../../abstracts/repo.abstract';
import CommitteeSessionModel, { Attendee, AttendeeRole, CommitteeSession, SessionType } from './committeeSession.model';
import knessetApiService from '../../utils/knesset-api.service';
import { getFileAsText } from '../../utils/files.service';
import personRepo from '../person/person.repo';
import { Committee } from '../committee/committee.model';
import logger from '../../utils/logger';
import _ from 'lodash';
import { Person } from '../person/person.model';
import committeeRepo from '../committee/committee.repo';
import { RunHistory } from '../runHistory/runHistory.model';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
class CommitteeSessionsRepo extends BaseRepo<CommitteeSession> {
  constructor() {
    super(CommitteeSessionModel);
  }

  async fetchCommitteesSessions(committee: DocumentType<Committee>, run: DocumentType<RunHistory>) {
    const committeesSessions = await knessetApiService.getCommitteeSessions(
      committee.originId,
      run?.entityId
    );
    if (!committeesSessions || !committeesSessions.length) {
      logger.info('No sessions found for committee', { committeeId: committee._id });
      return [];
    }
    logger.info( `Fetched ${ committeesSessions.length } sessions` );
    const arrangedCommitteesSessions = await this.arrangeCommitteesSessions(
      committee,
      committeesSessions
    );

    const data = await this.updateMany(arrangedCommitteesSessions, { upsert: true });
    const sessionsData = data.map(this.mapUpsert);
    logger.info(`Updated ${ sessionsData.length } sessions`);
    const sessionIds = _.chain(sessionsData).
      filter((session) => session.created).map((session) => session.id).value();
      // logger.info('Updating committee with sessions', { sessionIds });
    await committeeRepo.findAndUpdate({ _id: committee._id }, { sessions: sessionIds });
    logger.info({ message: 'Fetched sessions for committee', committeeId: committee._id });
    return sessionsData || [];
  }

  async arrangeCommitteesSessions(
    committee: DocumentType<Committee>, committeesSessions: any[]
  ): Promise<CommitteeSession[]> {
    const peopleList = await personRepo.peopleList as DocumentType<Person>[];
    const sessionsToSave: CommitteeSession[] = [];
    // const allMissingAttendees: any[] = [];
    let sessionNumber = 1;
    for (const session of committeesSessions) {
      logger.info(`Arranging session #${ sessionNumber++ } out of ${ committeesSessions.length }`,
        { sessionOriginId: session.CommitteeSessionID }
      );
      const mappedSession: Partial<CommitteeSession> = {};
      const transcript = await this.getTranscriptUrl(session.CommitteeSessionID);
      if (transcript) {
        mappedSession.transcriptUrl = transcript;

        const attendees = await this.getAttendees(transcript) as any;
        if (attendees?.attendees?.size) {
          mappedSession.attendees = Array.from(attendees.attendees).map((attendee: any) => {
            const person = peopleList.find((person) => person._id === attendee.person);
            if (!person?.committees) {
              return attendee;
            }
            const committeeReference = Array.from(person.committees).
              find((c) => c.committeeId?.toString() === committee._id?.toString());
            if (committeeReference) {
              attendee.role = committeeReference.isChairman ? AttendeeRole.Chairman : AttendeeRole.Member;
            } else {
              attendee.role = AttendeeRole.Guest;
            }
            return attendee;
          });
        }
        if (attendees.missingAttendees?.length) {
          mappedSession.missingAttendees = attendees.missingAttendees;
        }
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
      await wait(1000);
    }
    // logger.info('missingAttendees', { missing: allMissingAttendees });
    return sessionsToSave;
  }

  async getTranscriptUrl(committeeSessionId: number): Promise<string|null> {
    if (!committeeSessionId) {
      logger.log('committeeSession not found', committeeSessionId);
      throw new Error('committeeSession not found');
    }
    const committeeTranscript =
      await knessetApiService.getCommitteeSessionTranscript(
        committeeSessionId
      );
    return committeeTranscript?.length ? committeeTranscript[0].FilePath : null;
  }

  getAttendees = async (transcriptUrl: string) => {
    const transcriptText = await getFileAsText(transcriptUrl) as string;
    if (!transcriptText) {
      return [];
    }
    const attendees = await this.parseTranscript(transcriptText);
    return attendees;
  };

  parseTranscript = async (transcript: string): Promise<{
    attendees: Set<Attendee>;
    missingAttendees: (Attendee | string)[];
}> => {
    const attendees: Set<Attendee> = new Set();
    const missingAttendees: any[] = [];

    const text = transcript.split('נכחו')[1]?.split('מוזמנים')[0];
    const attendeesText = text?.split('חברי הוועדה:')[1]?.split('מוזמנים')[0];

    const attendeesLines = attendeesText?.split('\n\n');

    for (const line of attendeesLines || []) {
      if (line.includes('<< ') || line.includes('>> ') || line.includes('ייעוץ משפטי')) {
        break;
      }
      if (line.includes('חברי הכנסת:')) {
        continue;
      }
      const attendee = await this.extractAttendeesFromLine(line);
      if (!attendee) {
        continue;
      }
      if (!(attendee instanceof Attendee)) {
        missingAttendees.push(attendee);
        continue;
      }
      attendees.add(attendee as Attendee);
    }

    return { attendees, missingAttendees };
  };

  extractAttendeesFromLine = async (line: string) => {
    const words = line.split(' ');
    const noWords = words.length < 1;
    const isEmpty = words.every((word) => word === '');
    if (isEmpty || noWords) {
      return;
    }

    const person = await personRepo.getPersonFromText(line) as DocumentType<any>;

    if (!person) {
      return line;
    }

    const attendee = new Attendee();
    attendee.person = person._id;
    return attendee;
  };
}


export default new CommitteeSessionsRepo();
