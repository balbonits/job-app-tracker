import { Button, Modal, useToast } from 'ember-ui';
import { useState } from 'react';
import { Skeleton } from '../components';
import { usePageHeading } from '../lib/hooks';
import { exportJson } from '../lib/storage';
import { useStore } from '../lib/store';

export function Settings() {
  const { data, status, clearAll, resetDemo } = useStore();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const h1 = usePageHeading<HTMLHeadingElement>('Settings');
  return (
    <>
      <h1 ref={h1} tabIndex={-1}>Settings</h1>
      {status === 'loading' ? <Skeleton rows={1} label="Loading settings" /> : (
        <div className="jt-settings">
          <section aria-labelledby="s-export">
            <h2 id="s-export">Export</h2>
            <p className="jt-muted">Download every role and reminder as a JSON file. Your data only lives in this browser.</p>
            <Button variant="secondary" onClick={() => exportJson(data)}>Export JSON</Button>
          </section>
          <section aria-labelledby="s-demo">
            <h2 id="s-demo">Demo data</h2>
            <p className="jt-muted">Put the fictional sample roles back.</p>
            <Button variant="secondary" onClick={() => { resetDemo(); toast({ tone: 'success', title: 'Demo data restored' }); }}>Reset demo data</Button>
          </section>
          <section aria-labelledby="s-states">
            <h2 id="s-states">Preview states</h2>
            <p className="jt-muted">See the screens the way a new visitor, a slow load, or a device that can't save would.</p>
            <ul className="jt-links">
              <li><a href="?state=empty#/">Empty board</a></li>
              <li><a href="?state=loading#/">Loading</a></li>
              <li><a href="?state=error#/">Can't save error</a></li>
              <li><a href="./#/">Back to normal</a></li>
            </ul>
          </section>
          <section aria-labelledby="s-clear">
            <h2 id="s-clear">Clear data</h2>
            <p className="jt-muted">Delete every role and reminder on this device.</p>
            <Button variant="danger" onClick={() => setConfirm(true)}>Clear all data</Button>
          </section>
        </div>
      )}
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Clear all data?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { clearAll(); setConfirm(false); toast({ tone: 'info', title: 'All data cleared' }); }}>Clear data</Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>This removes {data.roles.length} {data.roles.length === 1 ? 'role' : 'roles'} and their reminders from this device. It can't be undone, so export first if you want a copy.</p>
      </Modal>
    </>
  );
}
