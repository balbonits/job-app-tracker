import { ToastProvider, useToast } from 'ember-ui';
import { useState } from 'react';
import { SaveErrorBanner } from './components';
import { isoDay } from './lib/dates';
import { href, useRoute } from './lib/route';
import { StoreProvider, useStore, type DemoState } from './lib/store';
import { RoleForm } from './RoleForm';
import { Board } from './screens/Board';
import { Reminders } from './screens/Reminders';
import { RoleDetail } from './screens/RoleDetail';
import { Settings } from './screens/Settings';

export function demoFromUrl(search: string): DemoState {
  const s = new URLSearchParams(search).get('state');
  return s === 'empty' || s === 'loading' || s === 'error' ? s : null;
}

export function App({ demo = demoFromUrl(window.location.search), loadDelay }: { demo?: DemoState; loadDelay?: number }) {
  return (
    <ToastProvider>
      <StoreProvider demo={demo} loadDelay={loadDelay}>
        <Shell demo={demo} />
      </StoreProvider>
    </ToastProvider>
  );
}

function Shell({ demo }: { demo: DemoState }) {
  const route = useRoute();
  const { data, canSave, addRole } = useStore();
  const toast = useToast();
  const [adding, setAdding] = useState(0); // a new key per open gives the form fresh values
  const dueCount = data.reminders.filter((m) => !m.done && m.due <= isoDay()).length;
  const current = (name: string) => (route.name === name ? 'page' : undefined);

  return (
    <div className="ember jt-app">
      {/* Hash routing owns the URL hash, so the skip link moves focus itself instead of navigating to #main. */}
      <a
        className="jt-skip"
        href="#main"
        onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}
      >
        Skip to content
      </a>
      <header className="jt-header">
        <a className="jt-brand" href={href.board}>Job tracker</a>
        <nav aria-label="Prototype">
          <ul>
            <li><a href={href.board} aria-current={current('board')}>Board</a></li>
            <li>
              <a href={href.reminders} aria-current={current('reminders')}>
                Reminders{dueCount > 0 && <span className="jt-badge"><span className="sr-only">, </span>{dueCount}<span className="sr-only"> due</span></span>}
              </a>
            </li>
            <li><a href={href.settings} aria-current={current('settings')}>Settings</a></li>
          </ul>
        </nav>
      </header>
      <p className="jt-demo-note">
        Prototype with fictional demo data, saved only in this browser.
        {demo && <> Previewing the <strong>{demo}</strong> state. <a href="./#/">Exit preview</a></>}
      </p>
      {!canSave && <SaveErrorBanner data={data} />}
      <main id="main" className="jt-main" tabIndex={-1}>
        {route.name === 'board' && <Board onAdd={() => setAdding((n) => n + 1)} />}
        {route.name === 'role' && <RoleDetail id={route.id} />}
        {route.name === 'reminders' && <Reminders />}
        {route.name === 'settings' && <Settings />}
      </main>
      <footer className="jt-footer">
        <p>
          A UX case study prototype by John Dilig, built with <a href="/ux/design-system/">Ember UI</a>.{' '}
          <a href="/ux/">All UX case studies</a> · <a href="https://github.com/balbonits/job-app-tracker">Source on GitHub</a>
        </p>
      </footer>
      {adding > 0 && (
        <RoleForm
          key={adding}
          open
          onClose={() => setAdding(0)}
          onSubmit={(v) => {
            const role = addRole({ company: v.company, title: v.title, link: v.link, stage: v.stage, remindOn: v.remind ? v.remindOn : undefined });
            setAdding(0);
            toast({ tone: 'success', title: 'Role saved', message: ` ${role.title} at ${role.company}.` });
          }}
        />
      )}
    </div>
  );
}
