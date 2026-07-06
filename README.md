# Customer Support Ticket & SLA Management System

A full-stack enterprise support system with role-based workflows, SLA tracking, ticket management, and analytics dashboards.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Tailwind CSS, Recharts, React Router |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT (JSON Web Tokens) |

## Project Structure

```
support-ticket-system/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Auth & validation middleware
│   ├── models/          # Validators
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   ├── utils/           # Helpers, constants, seed script
│   └── server.js        # Application entry point
├── frontend/
│   └── src/
│       ├── pages/       # Route-level page components
│       ├── components/  # Reusable UI components
│       ├── context/     # Auth context provider
│       ├── hooks/       # Custom React hooks
│       ├── services/    # API client layer
│       ├── charts/      # Recharts dashboard components
│       └── utils/       # Constants & helpers
├── database/
│   └── schema.sql       # MySQL schema + seed data
└── README.md
```

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm

## Database Setup

1. Start MySQL server
2. Run the schema script:

```bash
mysql -u root -p < database/schema.sql
```

Or import `database/schema.sql` via MySQL Workbench.

## Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
npm run dev
```

Server runs at **http://localhost:5000**

### Alternative: Seed users after schema

```bash
npm run seed
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:3000**

## Test Credentials

All accounts use password: **`password123`**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@support.com | password123 |
| Support Agent | agent@support.com | password123 |
| Support Agent 2 | agent2@support.com | password123 |
| Customer | customer@support.com | password123 |
| Customer 2 | customer2@support.com | password123 |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new customer |
| POST | `/api/login` | Login & get JWT token |
| GET | `/api/profile` | Get current user profile |
| GET | `/api/users` | List users (Admin only) |

### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tickets` | Create ticket (Customer) |
| GET | `/api/tickets` | List tickets (role-filtered) |
| GET | `/api/tickets/:id` | Get ticket details |
| PUT | `/api/tickets/:id` | Update ticket (Agent/Admin) |
| DELETE | `/api/tickets/:id` | Delete ticket (Admin) |
| POST | `/api/tickets/:id/comment` | Add comment |
| GET | `/api/tickets/:id/comments` | Get comments |

### SLA
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sla` | List all SLA records (Admin) |
| PUT | `/api/sla/:ticket_id` | Update SLA deadlines (Admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/admin` | Admin analytics |
| GET | `/api/dashboard/agent` | Agent dashboard |
| GET | `/api/dashboard/customer` | Customer dashboard |

## SLA Rules

| Priority | Response Deadline | Resolution Deadline |
|----------|-------------------|---------------------|
| Low | 24 hours | 72 hours |
| Medium | 12 hours | 48 hours |
| High | 4 hours | 24 hours |
| Critical | 1 hour | 8 hours |

## Write-Up Questions

### 1. Relationship between tickets, comments, and SLA tracking

- **tickets** is the central entity — each row represents a support request with status, priority, and assignment.
- **ticket_comments** has a many-to-one relationship with tickets (`ticket_id` FK). Comments record the conversation history and are used to determine the first agent response time for SLA calculations.
- **sla_tracking** has a one-to-one relationship with tickets (`ticket_id` UNIQUE FK). When a ticket is created, SLA deadlines are automatically calculated based on priority. The `breached_status` field is updated when comments are added or ticket status changes to Resolved/Closed.

### 2. Role-based access control implementation

RBAC is implemented at two layers:
- **Backend**: JWT middleware (`authenticate`) validates tokens on every protected route. An `authorize(...roles)` middleware restricts endpoints by role (e.g., only CUSTOMER can create tickets, only ADMIN can access SLA APIs). Service-layer checks further enforce ownership (customers see only their tickets, agents see only assigned tickets).
- **Frontend**: `ProtectedRoute` component checks authentication and role before rendering pages. Navigation menus are dynamically generated per role. API calls include the JWT in the Authorization header.

### 3. SLA breach identification

The system compares actual timestamps against SLA deadlines:
- **Response breach**: First comment timestamp (or current time if no comment) exceeds `response_deadline`
- **Resolution breach**: Ticket resolution time (or current time if unresolved) exceeds `resolution_deadline`
- Breach status is stored as: `None`, `Response Breached`, `Resolution Breached`, or `Both Breached`
- Recalculated automatically when comments are added or ticket status changes

### 4. Validations before closing a ticket

- Ticket status must be **Resolved** or **On Hold** before transitioning to **Closed**
- At least one comment from a **Support Agent** or **Admin** must exist (resolution comment required)
- Status transitions follow the defined workflow (e.g., Open → In Progress → Resolved → Closed)

### 5. Scaling optimization priority

**Ticket listing/query module** would be optimized first because:
- It is the highest-traffic endpoint (every role queries tickets constantly)
- Supports search, filters, and pagination which become expensive at scale
- Optimization strategies: database indexing on `status`, `priority`, `customer_id`, `assigned_agent_id`; query caching (Redis); read replicas; offset-based pagination; full-text search (Elasticsearch) for ticket search

## Screenshots

Application screenshots are available in [`docs/screenshots/`](docs/screenshots/):

| Screenshot | Description |
|------------|-------------|
| `01-login.png` | Login page |
| `02-analytics-dashboard.png` | Admin analytics dashboard |
| `03-ticket-creation.png` | Customer ticket creation form |
| `04-ticket-assignment.png` | Admin ticket assignment dashboard |
| `05-sla-dashboard.png` | SLA monitoring dashboard |
| `06-ticket-resolution.png` | Ticket resolution flow with comments |

## Screenshots Checklist

Capture screenshots for:
- [ ] Login page
- [ ] Ticket creation form
- [ ] Ticket assignment dashboard
- [ ] SLA monitoring dashboard
- [ ] Analytics dashboard (Admin)
- [ ] Ticket resolution flow (agent comments + status update)

## Demo Video Checklist

Record a short demo covering:
1. **Customer flow**: Login → Create ticket → View ticket → Add comment
2. **Agent flow**: Login → View assigned tickets → Update status → Add resolution comment → Resolve
3. **Admin flow**: Login → Assign ticket → Monitor SLA → View analytics dashboard
