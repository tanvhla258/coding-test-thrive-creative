import Link from "next/link";
import { prisma } from "@/lib/db";
import type { TicketStatus } from "@/types";
import CustomerNotesCRM from "../components/CustomerNotesCRM";

const PAGE_SIZE = 20;

export default async function CrmPage() {
  const [customers, total, statuses] = await Promise.all([
    prisma.customer.findMany({
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        company: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count(),
    prisma.ticketStatus.findMany({
      select: {
        id: true,
        name: true,
        color: true,
      },
    }) as Promise<TicketStatus[]>,
  ]);

  return (
    <div className="h-screen flex flex-col">
      <header className="flex-shrink-0 h-14 bg-indigo-700 flex items-center px-6 shadow-md">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/thrive-logo.jpg" alt="Thrive Creative" className="h-8 w-8 rounded object-cover" />
          <h1 className="text-white font-bold text-lg tracking-tight group-hover:underline">Customer Notes</h1>
        </Link>
        <span className="ml-3 text-indigo-300 text-xs font-medium bg-indigo-800 px-2 py-0.5 rounded-full">
          CRM
        </span>
      </header>

      <CustomerNotesCRM
        initialCustomers={customers}
        initialTotal={total}
        initialStatuses={statuses}
      />
    </div>
  );
}
