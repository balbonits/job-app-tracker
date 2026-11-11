import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '#/';
});

const renderApp = (demo: 'empty' | 'error' | null = null) => render(<App demo={demo} loadDelay={0} />);

describe('board', () => {
  it('shows the empty state with an Add role button', () => {
    renderApp('empty');
    expect(screen.getByText("No applications yet. Add the first role you're interested in.")).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Add role' })).toHaveLength(2);
  });

  it('shows the save error banner with Export when storage fails', () => {
    renderApp('error');
    const alert = screen.getByText(/Can't save changes/).closest('[role="alert"]') as HTMLElement;
    expect(alert).toHaveTextContent("Can't save changes on this device right now.");
    expect(within(alert).getByRole('button', { name: 'Export data' })).toBeInTheDocument();
  });

  it('shows a static loading skeleton first', () => {
    render(<App demo={null} loadDelay={10_000} />);
    expect(screen.getByRole('status', { name: 'Loading applications' })).toBeInTheDocument();
  });

  it('adds a role, with inline errors for missing fields', async () => {
    const u = userEvent.setup();
    renderApp('empty');
    await u.click(screen.getAllByRole('button', { name: 'Add role' })[0]);
    await u.click(screen.getByRole('button', { name: 'Save role' }));
    expect(screen.getByText(/Enter the company name\./)).toBeInTheDocument();
    expect(screen.getByText(/Enter the job title\./)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company/)).toHaveFocus();
    await u.type(screen.getByLabelText(/Company/), 'Test Co (fictional)');
    await u.type(screen.getByLabelText(/^Title/), 'UI Engineer');
    await u.click(screen.getByRole('button', { name: 'Save role' }));
    expect(screen.getByRole('link', { name: 'UI Engineer' })).toBeInTheDocument();
    expect(screen.getByText('Role saved')).toBeInTheDocument();
  });

  it('moves a card with "Move to..." (no drag) and adds a stage reminder', async () => {
    const u = userEvent.setup();
    renderApp();
    // Initech starts in Saved, the first tab on mobile.
    await u.click(screen.getByRole('button', { name: /Move or edit React Developer/ }));
    await u.selectOptions(screen.getByLabelText('Move to...'), 'applied');
    await u.click(screen.getByRole('tab', { name: /Applied/ }));
    const card = screen.getByRole('article', { name: /React Developer at Initech/ });
    expect(card).toHaveTextContent('Applied today');
    act(() => { window.location.hash = '#/reminders'; window.dispatchEvent(new HashChangeEvent('hashchange')); });
    expect(screen.getByText('Follow up on the application')).toBeInTheDocument();
  });
});

describe('reminders', () => {
  it('marks done with Undo, and shows the caught-up state', async () => {
    const u = userEvent.setup();
    window.location.hash = '#/reminders';
    renderApp();
    expect(screen.getByRole('heading', { name: /Overdue/ })).toBeInTheDocument();
    const before = screen.getAllByRole('button', { name: /^Mark done/ }).length;
    await u.click(screen.getAllByRole('button', { name: /^Mark done/ })[0]);
    expect(screen.getAllByRole('button', { name: /^Mark done/ })).toHaveLength(before - 1);
    await u.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getAllByRole('button', { name: /^Mark done/ })).toHaveLength(before);
    for (let i = 0; i < before; i++) await u.click(screen.getAllByRole('button', { name: /^Mark done/ })[0]);
    expect(screen.getByText("Nothing due. You're caught up.")).toBeInTheDocument();
  });
});

describe('role detail', () => {
  it('renders tabs and the timeline, and a not-found state', async () => {
    const u = userEvent.setup();
    window.location.hash = '#/role/r2';
    renderApp();
    expect(screen.getByRole('heading', { level: 1, name: 'Senior UI Developer' })).toBeInTheDocument();
    await u.click(screen.getByRole('tab', { name: 'Timeline' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Interviewing');
    act(() => { window.location.hash = '#/role/nope'; window.dispatchEvent(new HashChangeEvent('hashchange')); });
    expect(screen.getByRole('heading', { level: 1, name: 'Role not found' })).toBeInTheDocument();
  });
});

describe('settings', () => {
  it('clears data only after confirming', async () => {
    const u = userEvent.setup();
    window.location.hash = '#/settings';
    renderApp();
    await u.click(screen.getByRole('button', { name: 'Clear all data' }));
    await u.click(screen.getByRole('button', { name: 'Clear data' }));
    act(() => { window.location.hash = '#/'; window.dispatchEvent(new HashChangeEvent('hashchange')); });
    expect(screen.getByText("No applications yet. Add the first role you're interested in.")).toBeInTheDocument();
  });
});
