import { Input, Select, Tabs, useToast } from 'ember-ui';
import { useEffect, useId, useRef, useState } from 'react';
import { EmptyState, Skeleton } from '../components';
import { formatDay } from '../lib/dates';
import { usePageHeading } from '../lib/hooks';
import { href } from '../lib/route';
import { useStore } from '../lib/store';
import { STAGES, STAGE_LABEL, type Role, type Stage } from '../lib/types';

export function RoleDetail({ id }: { id: string }) {
  const { data, status } = useStore();
  const role = data.roles.find((r) => r.id === id);
  if (status === 'loading') return <><BackLink /><Skeleton rows={1} label="Loading role" /></>;
  if (!role) return <Missing />;
  return <Detail role={role} />;
}

function BackLink() {
  return <p className="jt-back"><a href={href.board}>← Back to board</a></p>;
}

function Missing() {
  const h1 = usePageHeading<HTMLHeadingElement>('Role not found');
  return (
    <>
      <BackLink />
      <h1 ref={h1} tabIndex={-1}>Role not found</h1>
      <EmptyState title="This role was deleted or never existed on this device.">
        <a className="jt-linkbtn" href={href.board}>Go to the board</a>
      </EmptyState>
    </>
  );
}

function Detail({ role }: { role: Role }) {
  const { data, moveRole } = useStore();
  const toast = useToast();
  const h1 = usePageHeading<HTMLHeadingElement>(`${role.title}, ${role.company}`);
  const reminders = data.reminders.filter((m) => m.roleId === role.id && !m.done);

  return (
    <>
      <BackLink />
      <div className="jt-detailhead">
        <div>
          <h1 ref={h1} tabIndex={-1}>{role.title}</h1>
          <p className="jt-sub">{role.company}</p>
        </div>
        <div className="jt-detailtools">
          <Select
            label="Stage"
            value={role.stage}
            onChange={(e) => {
              const to = e.target.value as Stage;
              moveRole(role.id, to);
              toast({ tone: 'success', title: `Moved to ${STAGE_LABEL[to]}` });
            }}
          >
            {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
          </Select>
          {role.link ? (
            <a className="jt-linkbtn" href={role.link} target="_blank" rel="noopener noreferrer">
              Open posting<span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <p className="jt-muted">No posting link saved.</p>
          )}
        </div>
      </div>
      <Tabs
        label="Role details"
        tabs={[
          { id: 'overview', label: 'Overview', content: <Overview role={role} reminderCount={reminders.length} /> },
          { id: 'notes', label: 'Notes', content: <Notes role={role} /> },
          { id: 'timeline', label: 'Timeline', content: <Timeline role={role} /> },
        ]}
      />
    </>
  );
}

function Overview({ role, reminderCount }: { role: Role; reminderCount: number }) {
  const { updateRole } = useStore();
  const [salary, setSalary] = useState(role.salary ?? '');
  const [contacts, setContacts] = useState(role.contacts);
  const applied = role.timeline.find((t) => t.stage === 'applied');
  return (
    <div className="jt-overview">
      <dl className="jt-facts">
        <div><dt>Applied</dt><dd>{applied ? formatDay(applied.at) : 'Not yet'}</dd></div>
        <div><dt>Last updated</dt><dd>{formatDay(role.updatedAt)}</dd></div>
        <div><dt>Open reminders</dt><dd>{reminderCount ? <a className="jt-count-link" href={href.reminders} aria-label={`${reminderCount} open reminders`}>{reminderCount}</a> : 'None'}</dd></div>
      </dl>
      <Input label="Salary range" hint="Optional, for example $120k to $140k." value={salary}
        onChange={(e) => setSalary(e.target.value)} onBlur={() => updateRole(role.id, { salary: salary.trim() || undefined })} />
      <Input label="Contacts" hint="Recruiter or hiring manager." value={contacts}
        onChange={(e) => setContacts(e.target.value)} onBlur={() => updateRole(role.id, { contacts: contacts.trim() })} />
    </div>
  );
}

function Notes({ role }: { role: Role }) {
  const { updateRole, canSave } = useStore();
  const [text, setText] = useState(role.notes);
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const id = useId();
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <div className="em-field">
      <label className="em-label" htmlFor={id}>Notes</label>
      <textarea
        id={id}
        className="em-control jt-textarea"
        rows={6}
        value={text}
        aria-describedby={`${id}-status`}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          setState('saving');
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => { updateRole(role.id, { notes: v }); setState('saved'); }, 600);
        }}
      />
      <p id={`${id}-status`} className="em-hint" role="status">
        {state === 'saving' ? 'Saving…' : state === 'saved' ? (canSave ? 'Saved' : 'Not saved on this device') : 'Notes save as you type.'}
      </p>
    </div>
  );
}

function Timeline({ role }: { role: Role }) {
  return (
    <ol className="jt-timeline">
      {[...role.timeline].reverse().map((t, i) => (
        <li key={`${t.stage}-${t.at}-${i}`}>
          <span className="jt-tl-stage">{STAGE_LABEL[t.stage]}</span>
          <time dateTime={t.at}>{formatDay(t.at)}</time>
        </li>
      ))}
    </ol>
  );
}

