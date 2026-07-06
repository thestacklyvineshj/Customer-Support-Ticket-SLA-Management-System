import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'screenshots');

const TOKEN = 'mock-jwt-token';
const ADMIN = { id: 1, name: 'Admin User', email: 'admin@support.com', role: 'ADMIN' };
const CUSTOMER = { id: 4, name: 'John Customer', email: 'customer@support.com', role: 'CUSTOMER' };

const mockTickets = [
  {
    id: 101, customer_id: 4, assigned_agent_id: 2, ticket_title: 'Payment not processed',
    ticket_description: 'My payment was deducted but order shows pending.', priority: 'High',
    category: 'Billing', status: 'Open', created_at: '2026-07-05T10:00:00', updated_at: '2026-07-05T10:00:00',
    customer_name: 'John Customer', agent_name: null, breached_status: 'None',
    response_deadline: '2026-07-05T14:00:00', resolution_deadline: '2026-07-06T10:00:00',
  },
  {
    id: 102, customer_id: 5, assigned_agent_id: 2, ticket_title: 'Cannot reset password',
    ticket_description: 'Reset email never arrives.', priority: 'Medium',
    category: 'Account', status: 'In Progress', created_at: '2026-07-04T09:00:00', updated_at: '2026-07-05T11:00:00',
    customer_name: 'Jane Customer', agent_name: 'Agent Smith', breached_status: 'None',
    response_deadline: '2026-07-04T21:00:00', resolution_deadline: '2026-07-06T09:00:00',
  },
  {
    id: 103, customer_id: 4, assigned_agent_id: 3, ticket_title: 'API integration error',
    ticket_description: 'Getting 500 errors on webhook endpoint.', priority: 'Critical',
    category: 'Technical', status: 'Resolved', created_at: '2026-07-03T08:00:00', updated_at: '2026-07-04T16:00:00',
    customer_name: 'John Customer', agent_name: 'Agent Johnson', breached_status: 'Response Breached',
    response_deadline: '2026-07-03T09:00:00', resolution_deadline: '2026-07-03T16:00:00',
  },
];

const dashboardAdmin = {
  summary: { totalTickets: 48, openTickets: 12, totalUsers: 15, slaBreachPercentage: 18 },
  ticketsByStatus: [
    { status: 'Open', count: 8 }, { status: 'In Progress', count: 4 },
    { status: 'On Hold', count: 2 }, { status: 'Resolved', count: 20 }, { status: 'Closed', count: 14 },
  ],
  ticketsByPriority: [
    { priority: 'Low', count: 10 }, { priority: 'Medium', count: 18 },
    { priority: 'High', count: 14 }, { priority: 'Critical', count: 6 },
  ],
  slaBreachPercentage: 18,
  agentResolutions: [
    { agent_name: 'Agent Smith', resolution_count: 15 },
    { agent_name: 'Agent Johnson', resolution_count: 12 },
  ],
  monthlyTrends: [
    { month: '2026-02', count: 5 }, { month: '2026-03', count: 8 },
    { month: '2026-04', count: 12 }, { month: '2026-05', count: 10 },
    { month: '2026-06', count: 15 }, { month: '2026-07', count: 8 },
  ],
  recentActivity: [
    { id: 1, user_name: 'Agent Smith', activity: 'Updated ticket #102', created_at: '2026-07-05T12:00:00' },
    { id: 2, user_name: 'John Customer', activity: 'Created ticket #101', created_at: '2026-07-05T10:00:00' },
  ],
};

const agents = [
  { id: 2, name: 'Agent Smith', email: 'agent@support.com', role: 'SUPPORT_AGENT' },
  { id: 3, name: 'Agent Johnson', email: 'agent2@support.com', role: 'SUPPORT_AGENT' },
];

const slaRecords = mockTickets.map((t, i) => ({
  id: i + 1, ticket_id: t.id, ticket_title: t.ticket_title, priority: t.priority,
  status: t.status, customer_name: t.customer_name, agent_name: t.agent_name,
  response_deadline: t.response_deadline, resolution_deadline: t.resolution_deadline,
  breached_status: t.breached_status,
}));

const comments = [
  { id: 1, ticket_id: 103, user_id: 4, comment: 'Webhook fails on every POST request.', user_name: 'John Customer', user_role: 'CUSTOMER', created_at: '2026-07-03T08:30:00' },
  { id: 2, ticket_id: 103, user_id: 2, comment: 'Identified misconfigured API key. Please regenerate and update.', user_name: 'Agent Johnson', user_role: 'SUPPORT_AGENT', created_at: '2026-07-03T09:15:00' },
  { id: 3, ticket_id: 103, user_id: 2, comment: 'Issue resolved after key rotation. Closing ticket.', user_name: 'Agent Johnson', user_role: 'SUPPORT_AGENT', created_at: '2026-07-04T15:00:00' },
];

function json(data) {
  return { contentType: 'application/json', body: JSON.stringify({ success: true, data }) };
}

async function setupMocks(page, role = 'ADMIN') {
  const profile = role === 'CUSTOMER' ? CUSTOMER : ADMIN;
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const p = url.pathname;

    if (p === '/api/login' && route.request().method() === 'POST') {
      return route.fulfill(json({ token: TOKEN, user: profile }));
    }
    if (p === '/api/profile') return route.fulfill(json(profile));
    if (p === '/api/dashboard/admin') return route.fulfill(json(dashboardAdmin));
    if (p === '/api/dashboard/customer') {
      return route.fulfill(json({
        summary: { totalTickets: 3 },
        ticketsByStatus: dashboardAdmin.ticketsByStatus,
        ticketsByPriority: dashboardAdmin.ticketsByPriority,
        recentTickets: mockTickets,
      }));
    }
    if (p === '/api/users' && url.searchParams.get('role') === 'SUPPORT_AGENT') {
      return route.fulfill(json(agents));
    }
    if (p === '/api/users') return route.fulfill(json([ADMIN, ...agents]));
    if (p === '/api/sla') return route.fulfill(json(slaRecords));
    if (p === '/api/tickets' && route.request().method() === 'GET') {
      const status = url.searchParams.get('status');
      const list = status ? mockTickets.filter((t) => t.status === status) : mockTickets;
      return route.fulfill(json({ tickets: list, pagination: { total: list.length, page: 1, limit: 10, totalPages: 1 } }));
    }
    if (p.match(/\/api\/tickets\/\d+\/comments$/)) {
      return route.fulfill(json(comments));
    }
    if (p.match(/\/api\/tickets\/\d+$/) && route.request().method() === 'GET') {
      const id = parseInt(p.split('/').pop());
      return route.fulfill(json(mockTickets.find((t) => t.id === id) || mockTickets[2]));
    }
    if (p === '/api/tickets' && route.request().method() === 'POST') {
      return route.fulfill({ status: 201, ...json({ ...mockTickets[0], id: 104 }) });
    }
    return route.fulfill(json({}));
  });
}

async function shot(page, name, url, opts = {}) {
  await page.goto(url, { waitUntil: 'networkidle' });
  if (opts.wait) await page.waitForTimeout(opts.wait);
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
  console.log('Captured:', name);
}

function startServer() {
  return spawn('npm', ['run', 'dev', '--', '--port', '3000'], {
    cwd: path.join(ROOT, 'frontend'),
    shell: true,
    stdio: 'pipe',
  });
}

async function waitForServer() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://localhost:3000');
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Frontend server did not start');
}

async function login(page, email, password, role) {
  await setupMocks(page, role);
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  const dest = role === 'CUSTOMER' ? '**/customer/dashboard' : '**/admin/dashboard';
  await page.waitForURL(dest);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const server = startServer();
  await waitForServer();

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await setupMocks(page);

  await shot(page, '01-login.png', 'http://localhost:3000/login');

  await login(page, 'admin@support.com', 'password123', 'ADMIN');
  await shot(page, '02-analytics-dashboard.png', 'http://localhost:3000/admin/dashboard', { wait: 1500 });

  await login(page, 'customer@support.com', 'password123', 'CUSTOMER');
  await page.goto('http://localhost:3000/customer/create');
  await page.waitForTimeout(500);
  await page.fill('input[placeholder*="Brief"]', 'Unable to access dashboard');
  await page.fill('textarea', 'After logging in, the dashboard shows a blank screen with no data loading.');
  await shot(page, '03-ticket-creation.png', 'http://localhost:3000/customer/create');

  await login(page, 'admin@support.com', 'password123', 'ADMIN');
  await shot(page, '04-ticket-assignment.png', 'http://localhost:3000/admin/assign', { wait: 1000 });
  await shot(page, '05-sla-dashboard.png', 'http://localhost:3000/admin/sla', { wait: 1000 });
  await shot(page, '06-ticket-resolution.png', 'http://localhost:3000/tickets/103', { wait: 1000 });

  await browser.close();
  server.kill();
  console.log('All screenshots saved to docs/screenshots/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
