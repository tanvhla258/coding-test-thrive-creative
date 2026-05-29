"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Customer, Note, Ticket, TicketStatus } from "@/types";
import { useDebounce } from "@/app/hooks/useDebounce";
import CustomerList from "./CustomerList";
import NotesPane from "./NotesPane";
import TicketsPane from "./TicketsPane";


interface Props {
  initialCustomers: Customer[];
  initialTotal: number;
  initialStatuses: TicketStatus[];
}

const PAGE_SIZE = 20;

export default function CustomerNotesCRM({ initialCustomers, initialTotal, initialStatuses }: Props) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [statuses] = useState<TicketStatus[]>(initialStatuses);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchCustomers = async (pageNum: number, searchTerm: string) => {
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(PAGE_SIZE),
      });
      if (searchTerm) params.set("search", searchTerm);
      
      const res = await fetch(`/api/customers?${params}`);
      const json = await res.json();
      setCustomers(json.data);
      setTotal(json.pagination.total);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  const handleSearch = (term: string) => {
    setSearch(term);
  };

  const handlePageChange = (newPage: number) => {
    fetchCustomers(newPage, search);
  };

  useEffect(() => {
    fetchCustomers(1, debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!selectedCustomer) {
      setNotes([]);
      setTickets([]);
      return;
    }

    const fetchData = async () => {
      setDetailLoading(true);
      try {
        const [notesRes, ticketsRes] = await Promise.all([
          fetch(`/api/customers/${selectedCustomer.id}/notes`),
          fetch(`/api/customers/${selectedCustomer.id}/tickets`),
        ]);
        const notesJson = await notesRes.json();
        const ticketsJson = await ticketsRes.json();
        setNotes(notesJson.data);
        setTickets(ticketsJson.data);
      } catch (err) {
        console.error("Failed to fetch customer data:", err);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchData();
  }, [selectedCustomer]);

  const handleAddNote = async (text: string, author: string) => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, author }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to add note (${res.status})`;
        toast.error(errorMessage);
        return;
      }
      
      const json = await res.json();
      setNotes((prev) => [json.data, ...prev]);
      toast.success("Note added successfully");
    } catch (err) {
      console.error("Failed to add note:", err);
      toast.error("Network error: Failed to add note");
    }
  };

  const handleAddTicket = async (subject: string, description: string, statusId: string) => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, description, statusId }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to add ticket (${res.status})`;
        toast.error(errorMessage);
        return;
      }
      
      const json = await res.json();
      setTickets((prev) => [json.data, ...prev]);
      toast.success("Ticket created successfully");
    } catch (err) {
      console.error("Failed to add ticket:", err);
      toast.error("Network error: Failed to add ticket");
    }
  };

  const handleUpdateNote = async (noteId: string, text: string, author: string) => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, author }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to update note (${res.status})`;
        toast.error(errorMessage);
        return;
      }
      
      const json = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === noteId ? json.data : n)));
      toast.success("Note updated successfully");
    } catch (err) {
      console.error("Failed to update note:", err);
      toast.error("Network error: Failed to update note");
    }
  };

  const handleUpdateTicket = async (ticketId: string, subject: string, description: string, statusId: string) => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, description, statusId }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to update ticket (${res.status})`;
        toast.error(errorMessage);
        return;
      }
      
      const json = await res.json();
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? json.data : t)));
      toast.success("Ticket updated successfully");
    } catch (err) {
      console.error("Failed to update ticket:", err);
      toast.error("Network error: Failed to update ticket");
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <CustomerList
        customers={customers}
        selectedId={selectedCustomer?.id ?? null}
        onSelect={setSelectedCustomer}
        search={search}
        onSearch={handleSearch}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {selectedCustomer ? (
        <div className="flex flex-1 overflow-hidden divide-x divide-gray-200">
          <TicketsPane
            customer={selectedCustomer}
            tickets={tickets}
            statuses={statuses}
            loading={detailLoading}
            onAddTicket={handleAddTicket}
            onUpdateTicket={handleUpdateTicket}
          />
          <NotesPane
            customer={selectedCustomer}
            notes={notes}
            loading={detailLoading}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
          />
        </div>
      ) : (
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-400 text-lg">Select a customer to view details</p>
          </div>
        </main>
      )}
    </div>
  );
}
