// Powered by OnSpace.AI
import { Colors } from './theme';

export type Outcome =
  | 'Contacted'
  | 'Call Again'
  | 'Not answered'
  | 'Not reachable'
  | 'Interested'
  | 'Qualified'
  | 'Ready to Apply'
  | 'Not interested'
  | 'Declined';

export const OUTCOMES: Outcome[] = [
  'Contacted',
  'Call Again',
  'Not answered',
  'Not reachable',
  'Interested',
  'Qualified',
  'Ready to Apply',
  'Not interested',
  'Declined',
];

export const CONVERT_OUTCOMES: Outcome[] = ['Interested', 'Qualified', 'Ready to Apply'];

export const OUTCOME_COLORS: Record<Outcome, string> = {
  'Contacted': Colors.outcomeContacted,
  'Call Again': Colors.outcomeCallAgain,
  'Not answered': Colors.outcomeNotAnswered,
  'Not reachable': Colors.outcomeNotReachable,
  'Interested': Colors.outcomeInterested,
  'Qualified': Colors.outcomeQualified,
  'Ready to Apply': Colors.outcomeReadyToApply,
  'Not interested': Colors.outcomeNotInterested,
  'Declined': Colors.outcomeDeclined,
};
