// Constants for CDMS Frontend

const RECORD_TYPES = {
  FIR: 'FIR',
  EVIDENCE: 'Evidence',
  REPORT: 'Report',
  WITNESS_STATEMENT: 'WitnessStatement'
};

const CASE_STATUSES = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  UNDER_INVESTIGATION: 'Under Investigation'
};

const USER_ROLES = {
  ADMIN: 'admin',
  INVESTIGATOR: 'investigator',
  FORENSICS: 'forensics',
  JUDGE: 'judge'
};

const ORGANIZATIONS = {
  ORG1: 'Org1MSP',
  ORG2: 'Org2MSP'
};

const ORG_NAMES = {
  'Org1MSP': 'Police Department',
  'Org2MSP': 'Judiciary'
};

const ROLE_DISPLAY_NAMES = {
  admin: 'Administrator',
  investigator: 'Investigator',
  forensics: 'Forensics Specialist',
  judge: 'Judge'
};

module.exports = {
  RECORD_TYPES,
  CASE_STATUSES,
  USER_ROLES,
  ORGANIZATIONS,
  ORG_NAMES,
  ROLE_DISPLAY_NAMES
};
