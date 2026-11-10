import { Button, Checkbox, Input, Modal, Select } from 'ember-ui';
import { useState, type FormEvent } from 'react';
import { addDays, isoDay } from './lib/dates';
import { STAGES, STAGE_LABEL, type Role, type Stage } from './lib/types';

export type RoleFormValues = { company: string; title: string; link: string; stage: Stage; remind: boolean; remindOn: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (v: RoleFormValues) => void;
  role?: Role; // edit mode when set
};

export function RoleForm({ open, onClose, onSubmit, role }: Props) {
  // Keyed by the caller so each open starts from fresh values.
  const [v, setV] = useState<RoleFormValues>({
    company: role?.company ?? '', title: role?.title ?? '', link: role?.link ?? '', stage: role?.stage ?? 'saved',
    remind: false, remindOn: addDays(isoDay(), 3),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RoleFormValues, string>>>({});
  const edit = Boolean(role);
  const formId = edit ? 'edit-role-form' : 'add-role-form';

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!v.company.trim()) next.company = 'Enter the company name.';
    if (!v.title.trim()) next.title = 'Enter the job title.';
    if (v.link.trim() && !/^https?:\/\/\S+\.\S+/.test(v.link.trim())) next.link = 'Enter a full link that starts with https://';
    if (!edit && v.remind && !v.remindOn) next.remindOn = 'Pick a date for the reminder.';
    setErrors(next);
    if (Object.keys(next).length) {
      const firstKey = Object.keys(next)[0];
      (document.querySelector(`#${formId} [name="${firstKey}"]`) as HTMLElement | null)?.focus();
      return;
    }
    onSubmit(v);
  }

  const set = <K extends keyof RoleFormValues>(k: K, val: RoleFormValues[K]) => setV((s) => ({ ...s, [k]: val }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={edit ? 'Edit role' : 'Add role'}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form={formId}>{edit ? 'Save changes' : 'Save role'}</Button>
        </>
      }
    >
      <form id={formId} className="jt-form" onSubmit={submit} noValidate>
        <Input label="Job link" name="link" type="url" inputMode="url" hint="Optional. Paste the posting URL." value={v.link} error={errors.link} onChange={(e) => set('link', e.target.value)} />
        <Input label="Company" name="company" required autoComplete="organization" value={v.company} error={errors.company} onChange={(e) => set('company', e.target.value)} />
        <Input label="Title" name="title" required value={v.title} error={errors.title} onChange={(e) => set('title', e.target.value)} />
        {!edit && (
          <>
            <Select label="Stage" name="stage" value={v.stage} onChange={(e) => set('stage', e.target.value as Stage)}>
              {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
            </Select>
            <Checkbox label="Remind me" name="remind" checked={v.remind} onChange={(e) => set('remind', e.target.checked)} />
            {v.remind && (
              <Input label="Reminder date" name="remindOn" type="date" value={v.remindOn} error={errors.remindOn} onChange={(e) => set('remindOn', e.target.value)} />
            )}
          </>
        )}
      </form>
    </Modal>
  );
}
