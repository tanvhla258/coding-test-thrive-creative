import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.customer.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "cust_001",
        name: "Sarah Chen",
        phone: "415-555-0123",
        email: "sarah@acme.com",
        company: "Acme Corp",
        status: "active",
      },
      {
        id: "cust_002",
        name: "Marcus Rodriguez",
        phone: "310-555-0456",
        email: "marcus@techstart.io",
        company: "TechStart Inc",
        status: "active",
      },
      {
        id: "cust_003",
        name: "Priya Patel",
        phone: "646-555-0789",
        email: "priya@novatech.dev",
        company: "Nova Tech",
        status: "lead",
      },
    ],
  });

  await prisma.note.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "note_001",
        customerId: "cust_001",
        text: "Discussed upgrading to enterprise plan. Very interested in AI features.",
        author: "Alex Rivera",
        createdAt: new Date("2025-05-15 10:30:00"),
      },
      {
        id: "note_002",
        customerId: "cust_001",
        text: "Follow-up call scheduled for next Tuesday.",
        author: "Alex Rivera",
        createdAt: new Date("2025-05-16 14:15:00"),
      },
      {
        id: "note_003",
        customerId: "cust_002",
        text: "Onboarding completed. Client is happy with initial setup.",
        author: "Jordan Kim",
        createdAt: new Date("2025-05-14 09:45:00"),
      },
    ],
  });

  await prisma.ticketStatus.createMany({
    skipDuplicates: true,
    data: [
      { id: "status_1", name: "Open", color: "blue" },
      { id: "status_2", name: "In Progress", color: "yellow" },
      { id: "status_3", name: "Waiting on Customer", color: "orange" },
      { id: "status_4", name: "Resolved", color: "green" },
      { id: "status_5", name: "Closed", color: "gray" },
    ],
  });

  await prisma.ticket.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "ticket_001",
        customerId: "cust_001",
        subject: "Login issue",
        description: "Cannot login to dashboard",
        statusId: "status_1",
        createdAt: new Date("2025-05-15 10:00:00"),
      },
      {
        id: "ticket_002",
        customerId: "cust_001",
        subject: "Feature request",
        description: "Add export to CSV",
        statusId: "status_2",
        createdAt: new Date("2025-05-16 11:30:00"),
      },
      {
        id: "ticket_003",
        customerId: "cust_002",
        subject: "Billing question",
        description: "Invoice discrepancy",
        statusId: "status_3",
        createdAt: new Date("2025-05-14 09:15:00"),
      },
    ],
  });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
