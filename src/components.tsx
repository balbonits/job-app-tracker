import { Button } from 'ember-ui';
import type { ReactNode } from 'react';
import { exportJson } from './lib/storage';
import type { Data } from './lib/types';

export function SaveErrorBanner({ data }: { data: Data }) {
  return (
    <div role="alert" className="jt-banner">
      <p>Can't save changes on this device right now. Export your data to keep a copy.</p>
      <Button variant="secondary" onClick={() => exportJson(data)}>Export data</Button>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="jt-empty">
      <p className="jt-empty-title">{title}</p>
      {children}
    </div>
  );
}

/** Static placeholder blocks: no shimmer animation, so reduced-motion users see the same thing. */
export function Skeleton({ rows = 3, label = 'Loading applications' }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="jt-skeleton">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="jt-skel-card" aria-hidden="true">
          <span className="jt-skel-line" style={{ width: '45%' }} />
          <span className="jt-skel-line" style={{ width: '70%' }} />
          <span className="jt-skel-line" style={{ width: '35%' }} />
        </div>
      ))}
    </div>
  );
}
