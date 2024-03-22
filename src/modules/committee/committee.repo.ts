import BaseRepo from '../../abstracts/repo.abstract';
import CommitteeModel, { Committee } from './committee.model';
import knessetApiService from '../../utils/knesset-api.service';
import _ from 'lodash';

class CommitteeRepo extends BaseRepo<Committee> {
  typeEnum: Record<number, string> = {
    70: 'knesset',
    71: 'main',
    72: 'special',
    73: 'joint'
  };

  subTypeEnum: Record<number, string> = {
    991: 'permanent',
    72: 'special',
    993: 'investigation'
  };

  committeeIdToCategoryMap: Record<string, string> = {
    '65bbe7d1e8350e32474895d8': '65d4797a76e4a97122327c9c',
    '65bbe7d1e8350e32474895f8': '65be68105867b500fd71e7dd',
    '65bbe7d0e8350e32474895b0': '65be68105867b500fd71e7d4',
    '65bbe7d0e8350e32474895ac': '65be68105867b500fd71e7d0',
    '65bbe7d0e8350e32474895be': '65be68105867b500fd71e7db',
    '65bbe7d1e8350e32474895ee': '65be68105867b500fd71e7d1',
    '65bbe7d1e8350e32474895dc': '', // הוועדה למיזמים ציבורייםת
    '65bbe7d1e8350e32474895f4': '65be68105867b500fd71e7d4',
    '65bbe7d1e8350e32474895f2': '65be68105867b500fd71e7d1',
    '65bbe7d0e8350e32474895ca': '65be68105867b500fd71e7d1',
    '65bbe7d0e8350e32474895b2': '65be68105867b500fd71e7d6',
    '65bbe7d0e8350e32474895d0': '', // "הוועדה המיוחדת לזכויות הילד"
    '65bbe7d0e8350e32474895b6': '', // "ועדת הכנסת"
    '65bbe7d0e8350e32474895ba': '65be68105867b500fd71e7d9',
    '65bbe7d0e8350e32474895c2': '65be68105867b500fd71e7dd',
    '65bbe7d1e8350e32474895fa': '65be68105867b500fd71e7dd',
    '65bbe7d0e8350e32474895b4': '65be68105867b500fd71e7d7',
    '65bbe7d0e8350e32474895cc': '65be68105867b500fd71e7d2',
    '65bbe7d1e8350e32474895f0': '', // "הוועדה המיוחדת לתיקונים לחוק יסוד: הממשלה"
    '65bbe7d1e8350e32474895e6': '65be68105867b500fd71e7d8',
    '65bbe7d0e8350e32474895ae': '65be68105867b500fd71e7d3',
    '65bbe7d0e8350e32474895aa': '65be68105867b500fd71e7d1',
    '65bbe7d0e8350e32474895c8': '', // הוועדה המיוחדת לדיון בהצעת חוק-יסוד: הממשלה (תיקון - שר נוסף במשרד) (פ/81/25) ובהצעת חוק-יסוד: הממשלה (תיקון – כשירותם של שרים) (פ/91/25)
    '65bbe7d0e8350e32474895c0': '65be68105867b500fd71e7dc',
    '65bbe7d1e8350e32474895f6': '65be68105867b500fd71e7d4'
  };
  constructor() {
    super(CommitteeModel);
  }

  async fetchCommitteesFromKnessetApi() {
    const mainCommitteesFromApi = await knessetApiService.getMainCommittees();
    const arrangedCommittees = await this.arrangeCommittees(mainCommitteesFromApi);
    await this.findOrCreate(arrangedCommittees);

    const subCommitteesFromApi = await knessetApiService.getSubCommittees();
    const arrangedSubCommittees = await this.arrangeCommittees(subCommitteesFromApi);
    await this.findOrCreate(arrangedSubCommittees);
  }

  async arrangeCommittees(committees: any[]) {
    for await (const committee of committees) {
      if (committee.ParentCommitteeID) {
        const parentCommittee = await this.findOne({
          originId: committee.ParentCommitteeID
        });
        _.set(committee, 'parentCommittee', parentCommittee?._id);
      }
    }

    return committees.map((committee: any) => ({
      name: committee.Name,
      originId: committee.CommitteeID,
      email: committee.Email,
      type: this.typeEnum[committee.CommitteeTypeID],
      subType: this.subTypeEnum[committee.AdditionalTypeID],
      parentCommittee: committee.parentCommittee,
      knessetNum: committee.KnessetNum
    }));
  }

  async updateCommitteesMembers(persons: any) {
    const committeesToPerson = [];
    for (const person of persons) {
      for (const committee of person.committees) {
        committeesToPerson.push({
          committee: committee.committeeId,
          person: person._id
        });
      }
    }
    for await (const committeeToPerson of committeesToPerson) {
      await this.findAndUpdate(
        {
          _id: committeeToPerson.committee
        },
        {
          $addToSet: { members: committeeToPerson.person }
        }
      );
    }
  }

  categoryByCommitteeId(id: string) {
    return this.committeeIdToCategoryMap[id];
  }
}

export default new CommitteeRepo();
