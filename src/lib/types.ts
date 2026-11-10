export const STAGES = ['saved', 'applied', 'interviewing', 'offer', 'closed'] as const;
export type Stage = (typeof STAGES)[number];
export const STAGE_LABEL: Record<Stage, string> = {
  saved: 'Saved', applied: 'Applied', interviewing: 'Interviewing', offer: 'Offer', closed: 'Closed',
};

export type TimelineEntry = { stage: Stage; at: string };
export type Role = {
  id: string;
  company: string;
  title: string;
  link?: string;
  salary?: string;
  stage: Stage;
  createdAt: string;
  updatedAt: string;
  stageChangedAt: string;
  notes: string;
  contacts: string;
  timeline: TimelineEntry[];
};
export type Reminder = { id: string; roleId: string; text: string; due: string; done: boolean };
export type Data = { version: 1; roles: Role[]; reminders: Reminder[] };
