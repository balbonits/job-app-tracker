import { Button, Modal, Select, Tabs, useToast } from 'ember-ui';
import { useId, useState } from 'react';
import { EmptyState, Skeleton } from '../components';
import { agoText, formatDay } from '../lib/dates';
import { useMediaQuery, usePageHeading } from '../lib/hooks';
import { href } from '../lib/route';
import { useStore } from '../lib/store';
import { STAGES, STAGE_LABEL, type Role, type Stage } from '../lib/types';
import { RoleForm } from '../RoleForm';

export function Board({ onAdd }: { onAdd: () => void }) {
  const { data, status } = useStore();
  const wide = useMediaQuery('(min-width: 960px)');
  const h1 = usePageHeading<HTMLHeadingElement>('Applications');
  const byStage = (s: Stage) => data.roles.filter((r) => r.stage === s);

  return (
    <>
      <div className="jt-pagehead">
        <h1 ref={h1} tabIndex={-1}>Applications</h1>
        <Button onClick={onAdd}>Add role</Button>
      </div>
      {status === 'loading' ? (
        <Skeleton rows={wide ? 5 : 3} />
      ) : data.roles.length === 0 ? (
        <EmptyState title="No applications yet. Add the first role you're interested in.">
          <Button onClick={onAdd}>Add role</Button>
        </EmptyState>
      ) : wide ? (
        <div className="jt-columns">
          {STAGES.map((s) => (
            <Column key={s} stage={s} roles={byStage(s)} />
          ))}
        </div>
      ) : (
        <Tabs
          label="Stages"
          tabs={STAGES.map((s) => ({
            id: s,
            label: `${STAGE_LABEL[s]} (${byStage(s).length})`,
            content: (
              <>
                <h2 className="sr-only">{STAGE_LABEL[s]}</h2>
                <CardList stage={s} roles={byStage(s)} />
              </>
            ),
          }))}
        />
      )}
    </>
  );
}

function Column({ stage, roles }: { stage: Stage; roles: Role[] }) {
  const id = useId();
  const head = (
    <h2 id={id} className="jt-colhead">
      {STAGE_LABEL[stage]} <span className="jt-count">{roles.length}</span>
    </h2>
  );
  if (stage === 'closed') {
    // Closed collapses by default so the active pipeline stays in view.
    return (
      <section className="jt-column" aria-labelledby={id}>
        <details className="jt-closed">
          <summary>{head}</summary>
          <CardList stage={stage} roles={roles} />
        </details>
      </section>
    );
  }
  return (
    <section className="jt-column" aria-labelledby={id}>
      {head}
      <CardList stage={stage} roles={roles} />
    </section>
  );
}

function CardList({ stage, roles }: { stage: Stage; roles: Role[] }) {
  if (roles.length === 0) return <p className="jt-muted jt-colempty">No roles in {STAGE_LABEL[stage]}.</p>;
  return (
    <ul className="jt-cards">
      {roles.map((r) => <li key={r.id}><RoleCard role={r} /></li>)}
    </ul>
  );
}

const STAGE_VERB: Record<Stage, string> = { saved: 'Saved', applied: 'Applied', interviewing: 'Interviewing since', offer: 'Offer', closed: 'Closed' };

export function RoleCard({ role }: { role: Role }) {
  const { data, moveRole, updateRole, deleteRole, restoreRole } = useStore();
  const toast = useToast();
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const menuId = useId();
  const next = data.reminders.filter((m) => m.roleId === role.id && !m.done).sort((a, b) => a.due.localeCompare(b.due))[0];
  const since = agoText(role.stageChangedAt);

  return (
    <article className="jt-card" aria-label={`${role.title} at ${role.company}`}>
      <p className="jt-card-company">{role.company}</p>
      <h3 className="jt-card-title"><a href={href.role(role.id)}>{role.title}</a></h3>
      <p className="jt-card-age">{STAGE_VERB[role.stage]} {since === 'today' ? 'today' : since}</p>
      {next && <p className="jt-chip">Reminder: {next.text}, {formatDay(next.due)}</p>}
      <div className="jt-card-actions">
        <Button variant="ghost" aria-expanded={menu} aria-controls={menuId} aria-label={`Actions for ${role.title} at ${role.company}`} onClick={() => setMenu((o) => !o)}>
          Actions
        </Button>
      </div>
      {menu && (
        <div id={menuId} className="jt-menu">
          <Select
            label="Move to..."
            value={role.stage}
            onChange={(e) => {
              const to = e.target.value as Stage;
              moveRole(role.id, to);
              toast({ tone: 'success', title: `Moved to ${STAGE_LABEL[to]}`, message: ` ${role.title} at ${role.company}.` });
            }}
          >
            {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
          </Select>
          <div className="jt-row">
            <Button variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
            <Button variant="danger" onClick={() => setConfirm(true)}>Delete</Button>
          </div>
        </div>
      )}
      {editing && (
        <RoleForm
          open
          role={role}
          onClose={() => setEditing(false)}
          onSubmit={(v) => {
            updateRole(role.id, { company: v.company.trim(), title: v.title.trim(), link: v.link.trim() || undefined });
            setEditing(false);
            toast({ tone: 'success', title: 'Role updated' });
          }}
        />
      )}
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete this role?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>Keep it</Button>
            <Button
              variant="danger"
              onClick={() => {
                const reminders = data.reminders.filter((m) => m.roleId === role.id);
                const gone = deleteRole(role.id);
                setConfirm(false);
                if (gone) toast({ tone: 'info', title: 'Role deleted', action: { label: 'Undo', onAction: () => restoreRole(gone, reminders) } });
              }}
            >
              Delete role
            </Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>{role.title} at {role.company} and its reminders will be removed.</p>
      </Modal>
    </article>
  );
}
