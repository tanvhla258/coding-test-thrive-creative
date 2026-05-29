import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

const NOTE_TEMPLATES = [
  "Discussed pricing and contract terms. Client seems interested.",
  "Follow-up call scheduled for next week.",
  "Client requested additional product demos.",
  "Reviewed quarterly performance metrics.",
  "Addressed concerns about service reliability.",
  "Introduced new feature roadmap to client.",
  "Negotiated renewal terms for next year.",
  "Client provided feedback on user interface.",
  "Resolved billing discrepancy from last month.",
  "Scheduled onboarding session for new team members.",
];

const AUTHORS = ["Alex Rivera", "Jordan Kim", "Sam Taylor", "Morgan Lee", "Casey Brooks", "Riley Quinn"];

const TICKET_TEMPLATES = [
  { subject: "Login issue", description: "Cannot access the dashboard after password reset." },
  { subject: "Billing inquiry", description: "Unexpected charge on last invoice." },
  { subject: "Feature request", description: "Request to add CSV export functionality." },
  { subject: "Performance issue", description: "Dashboard loading takes over 30 seconds." },
  { subject: "Integration help", description: "Need assistance connecting third-party API." },
  { subject: "Account upgrade", description: "Want to upgrade from basic to enterprise plan." },
  { subject: "Data export", description: "Need to export all account data for compliance." },
  { subject: "Mobile app bug", description: "App crashes when opening reports on iOS." },
  { subject: "Permission error", description: "Team members cannot access shared workspace." },
  { subject: "Webhook failure", description: "Webhooks stopped firing after recent update." },
];

const STATUSES: Array<"active" | "lead" | "inactive"> = ["active", "lead", "inactive"];

function pickStatus(): "active" | "lead" | "inactive" {
  const r = Math.random();
  if (r < 0.6) return "active";
  if (r < 0.85) return "lead";
  return "inactive";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): Date {
  const now = Date.now();
  const offset = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(now - offset);
}

function pad(n: number, len: number): string {
  return String(n).padStart(len, "0");
}

async function main() {
  console.log("Seeding 500 customers...");

  const customers: Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    company: string;
    status: "active" | "lead" | "inactive";
  }> = [];

  const notes: Array<{
    id: string;
    customerId: string;
    text: string;
    author: string;
    createdAt: Date;
  }> = [];

  const tickets: Array<{
    id: string;
    customerId: string;
    subject: string;
    description: string;
    statusId: string;
    createdAt: Date;
  }> = [];

  for (let i = 1; i <= 500; i++) {
    const custId = `cust_${pad(i + 3, 3)}`;
    const num = pad(i, 3);

    customers.push({
      id: custId,
      name: `User ${num}`,
      phone: `555-555-${pad(i, 4)}`,
      email: `user${num}@example.com`,
      company: `Company ${num}`,
      status: pickStatus(),
    });

    const noteCount = 1 + Math.floor(Math.random() * 3);
    for (let j = 1; j <= noteCount; j++) {
      notes.push({
        id: `note_gen_${custId}_${j}`,
        customerId: custId,
        text: pickRandom(NOTE_TEMPLATES),
        author: pickRandom(AUTHORS),
        createdAt: randomDate(90),
      });
    }

    const ticketCount = 1 + Math.floor(Math.random() * 2);
    for (let j = 1; j <= ticketCount; j++) {
      const tmpl = pickRandom(TICKET_TEMPLATES);
      tickets.push({
        id: `ticket_gen_${custId}_${j}`,
        customerId: custId,
        subject: tmpl.subject,
        description: tmpl.description,
        statusId: `status_${1 + Math.floor(Math.random() * 5)}`,
        createdAt: randomDate(90),
      });
    }

    if (i % 100 === 0) {
      console.log(`  Generated data for ${i}/500 customers...`);
    }
  }

  console.log("Inserting customers in batches...");
  for (let i = 0; i < customers.length; i += 100) {
    await prisma.customer.createMany({
      skipDuplicates: true,
      data: customers.slice(i, i + 100),
    });
    console.log(`  Customers: ${Math.min(i + 100, customers.length)}/${customers.length}`);
  }

  console.log("Inserting notes in batches...");
  for (let i = 0; i < notes.length; i += 200) {
    await prisma.note.createMany({
      skipDuplicates: true,
      data: notes.slice(i, i + 200),
    });
    console.log(`  Notes: ${Math.min(i + 200, notes.length)}/${notes.length}`);
  }

  console.log("Inserting tickets in batches...");
  for (let i = 0; i < tickets.length; i += 200) {
    await prisma.ticket.createMany({
      skipDuplicates: true,
      data: tickets.slice(i, i + 200),
    });
    console.log(`  Tickets: ${Math.min(i + 200, tickets.length)}/${tickets.length}`);
  }

  console.log(`Done. Inserted ${customers.length} customers, ~${notes.length} notes, ~${tickets.length} tickets.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
