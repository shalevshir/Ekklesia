const mapIdToRole: Record<number, string> = {
  29: 'headOfCoalition',
  30: 'headOtCoalition',
  31: 'pmDeputy',
  39: 'minister',
  40: 'ministerDeputy',
  41: 'committeeChairman',
  42: 'committeeMember',
  43: 'knessetMember',
  45: 'pm',
  48: 'headOfFaction',
  49: 'ministerReplacement',
  50: 'pmDeputy',
  51: 'pmReplacement',
  54: 'factionMember',
  57: 'minister',
  59: 'ministerDeputy',
  61: 'km',
  65: 'pmDeputy',
  66: 'committeeMember',
  67: 'committeeMemberReplacement',
  70: 'headOfParliamentDeputy',
  71: 'headOfParliamentDeputy',
  73: 'pmReplacement',
  122: 'headOfParliament',
  123: 'headOfParliament',
  130: 'headOfOpposition',
  131: 'headOfOpposition',
  663: 'committeeViewer',
  285078: 'headOfParliamentReplacement',
  285079: 'ministerDeputy'
};

const rolesEnum = Object.values(mapIdToRole);

export { rolesEnum, mapIdToRole };
