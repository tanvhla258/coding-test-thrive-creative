import { prisma } from "@/lib/db";
import type { TicketStatus } from "@/types";
import CustomerNotesCRM from "./components/CustomerNotesCRM";

export default async function HomePage() {
  const [customers, statuses] = await Promise.all([
    prisma.customer.findMany({
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
        <img src="/thrive-logo.jpg" alt="Thrive Creative" className="h-8 w-8 rounded object-cover" />
        <h1 className="text-white font-bold text-lg tracking-tight ml-3">Customer Notes</h1>
        <span className="ml-3 text-indigo-300 text-xs font-medium bg-indigo-800 px-2 py-0.5 rounded-full">
          CRM
        </span>
      </header>

      <CustomerNotesCRM
        initialCustomers={customers}
        initialStatuses={statuses}
      />
    </div>
  );
}
