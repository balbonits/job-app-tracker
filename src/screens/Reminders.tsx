import { Button, useToast } from 'ember-ui';
import { EmptyState, Skeleton } from '../components';
import { dueGroup, formatDay, type DueGroup } from '../lib/dates';
import { usePageHeading } from '../lib/hooks';
import { href } from '../lib/route';
import { useStore } from '../lib/store';

const GROUPS: { id: DueGroup; label: string }[] = [
  { id: 'overdue', label: 'Overdue' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'later', label: 'Later' },
];

export function Reminders() {
  const { data, status, setReminderDone, snoozeReminder } = useStore();
  const toast = useToast();
  const h1 = usePageHeading<HTMLHeadingElement>('Reminders');
  const open = data.reminders.filter((m) => !m.done).sort((a, b) => a.due.localeCompare(b.due));
  const roleOf = (id: string) => data.roles.find((r) => r.id === id);

  return (
    <>
      <h1 ref={h1} tabIndex={-1}>Reminders</h1>
      {status === 'loading' ? (
        <Skeleton rows={2} label="Loading reminders" />
      ) : open.length === 0 ? (
        <EmptyState title="Nothing due. You're caught up.">
          <a className="jt-linkbtn" href={href.board}>Back to the board</a>
        </EmptyState>
      ) : (
        GROUPS.map((g) => {
          const items = open.filter((m) => dueGroup(m.due) === g.id);
          if (!items.length) return null;
          return (
            <section key={g.id} className="jt-group" aria-labelledby={`g-${g.id}`}>
              <h2 id={`g-${g.id}`} className={g.id === 'overdue' ? 'jt-overdue' : undefined}>
                {g.label} <span className="jt-count">{items.length}</span>
              </h2>
              <ul className="jt-reminders">
                {items.map((m) => {
                  const role = roleOf(m.roleId);
                  return (
                    <li key={m.id} className="jt-reminder">
                      <div>
                        <p className="jt-rem-text">{m.text}</p>
                        <p className="jt-muted">
                          {role ? <a href={href.role(role.id)}>{role.title}, {role.company}</a> : 'Deleted role'} · <time dateTime={m.due}>{formatDay(m.due)}</time>
                        </p>
                      </div>
                      <div className="jt-row">
                        <Button aria-label={`Mark done: ${m.text}`} onClick={() => {
                          setReminderDone(m.id, true);
                          toast({ tone: 'success', title: 'Reminder done', action: { label: 'Undo', onAction: () => setReminderDone(m.id, false) } });
                        }}>
                          Mark done
                        </Button>
                        <Button variant="secondary" aria-label={`Snooze 3 days: ${m.text}`} onClick={() => {
                          snoozeReminder(m.id, 3);
                          toast({ tone: 'info', title: 'Snoozed 3 days' });
                        }}>
                          Snooze 3 days
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}
    </>
  );
}
