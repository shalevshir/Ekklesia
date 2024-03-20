import { DocumentType } from '@typegoose/typegoose';
import BaseRepo from '../../abstracts/repo.abstract';
import CommitteeSessionModel, { Attendee, AttendeeRole, CommitteeSession } from './committeeSession.model';
import knessetApiService from '../../utils/knesset-api.service';
import committeeRepo from '../committee/committee.repo';
import _ from 'lodash';
import { getFileAsText } from '../../utils/files.service';
import { logger } from '@typegoose/typegoose/lib/logSettings';
import personRepo from '../person/person.repo';

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

    await this.findOrCreate(arrangedCommitteesSessions);
  }

  async arrangeCommitteesSessions(committeesSessions: any[]) {
    for await (const committeeSession of committeesSessions) {
      const committee = await committeeRepo.findOne({
        originId: committeeSession.CommitteeID
      });
      if (!committee) {
        console.log('committee not found', committeeSession.CommitteeID);
        continue;
      }
      _.set(committeeSession, 'committee', committee._id);
    }

    return committeesSessions.map((committeeSession) => ({
      originId: committeeSession.CommitteeSessionID,
      committee: committeeSession.committee,
      date: committeeSession.StartDate,
      type: committeeSession.TypeDesc === 'פתוחה' ? 'open' : 'tour',
      sessionUrl: committeeSession.SessionUrl,
      broadcastUrl: committeeSession.BroadcastUrl,
      status: committeeSession.StatusDesc,
      sessionNumber: committeeSession.Number
    }));
  }

  async updateCommitteesSessions(committeeSession: DocumentType<CommitteeSession>) {
    if (!committeeSession?.originId) {
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

  parseTranscript = async (transcript: string) => {
    const attendees: Attendee[] = [];
    const missingAttendees = [];

    const text = transcript.split('נכחו')[1].split('מוזמנים')[0];
    const membersText = text.split('חברי הוועדה:')[1].split('חברי הכנסת')[0];
    const guestsMksText = text.split('חברי הכנסת:')[1]?.split('מוזמנים')[0];

    const membersLines = membersText.split('\n\n');
    if (!membersLines?.length) {
      logger.error('membersLines not found', membersText);
      return [];
    }

    for (const line of membersLines) {
      if (line.includes('משתתפים')) {
        break;
      }
      const role = line.includes('יו"ר') ? AttendeeRole.Chairman : AttendeeRole.Member;
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
    let lastName = words[1];
    if ( words[2] && !words[2].includes('–') ) {
      lastName += '.*' + words[2];
    }

    const name = new RegExp(`^${ firstName }.*${ lastName }$`);
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
