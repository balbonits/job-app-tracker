import { addDays, isoDay } from './dates';
import type { Data, Role, Stage } from './types';

// Demo data. Every company here is made up (classic placeholder names), so nothing reads as a real application.
export function seed(now: Date = new Date()): Data {
  const today = isoDay(now);
  const back = (n: number) => addDays(today, -n);
  const role = (id: string, company: string, title: string, stage: Stage, path: [Stage, number][], extra: Partial<Role> = {}): Role => ({
    id, company, title, stage,
    createdAt: back(path[0][1]),
    updatedAt: back(path[path.length - 1][1]),
    stageChangedAt: back(path[path.length - 1][1]),
    notes: '', contacts: '',
    timeline: path.map(([s, n]) => ({ stage: s, at: back(n) })),
    ...extra,
  });
  return {
    version: 1,
    roles: [
      role('r1', 'Acme Corp (fictional)', 'Front-end Engineer', 'applied', [['saved', 9], ['applied', 6]], {
        link: 'https://example.com/jobs/acme-frontend', salary: '$120k to $140k',
        notes: 'Design system team. Mention the Ember UI work.', contacts: 'Recruiter: R. Runner (fictional)',
      }),
      role('r2', 'Globex Inc. (fictional)', 'Senior UI Developer', 'interviewing', [['saved', 20], ['applied', 15], ['interviewing', 3]], {
        link: 'https://example.com/jobs/globex-ui', notes: 'Second round is a pairing exercise.',
      }),
      role('r3', 'Initech (fictional)', 'React Developer', 'saved', [['saved', 1]], { link: 'https://example.com/jobs/initech-react' }),
      role('r4', 'Hooli Labs (fictional)', 'Accessibility Engineer', 'offer', [['saved', 30], ['applied', 26], ['interviewing', 18], ['offer', 2]], {
        salary: '$135k', notes: 'Offer letter due by Friday.',
      }),
      role('r5', 'Umbrella Apps (fictional)', 'Web Platform Engineer', 'closed', [['saved', 40], ['applied', 35], ['closed', 12]], {
        notes: 'Role was filled internally.',
      }),
    ],
    reminders: [
      { id: 'm1', roleId: 'r1', text: 'Follow up with recruiter', due: back(1), done: false },
      { id: 'm2', roleId: 'r2', text: 'Send thank-you note', due: today, done: false },
      { id: 'm3', roleId: 'r4', text: 'Reply to the offer', due: addDays(today, 3), done: false },
      { id: 'm4', roleId: 'r3', text: 'Apply before the posting closes', due: addDays(today, 6), done: false },
    ],
  };
}
