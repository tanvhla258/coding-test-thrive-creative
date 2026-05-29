"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Customer, Note, Ticket, TicketStatus } from "@/types";
import CustomerList from "./CustomerList";
import NotesPane from "./NotesPane";
import TicketsPane from "./TicketsPane";


interface Props {
  initialCustomers: Customer[];
  initialStatuses: TicketStatus[];
}

export default function CustomerNotesCRM({ initialCustomers, initialStatuses }: Props) {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [statuses] = useState<TicketStatus[]>(initialStatuses);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (!selectedCustomer) {
      setNotes([]);
      setTickets([]);
      return;
    }

    const fetchData = async () => {
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

  return (
    <div className="flex flex-1 overflow-hidden">
      <CustomerList
        customers={customers}
        selectedId={selectedCustomer?.id ?? null}
        onSelect={setSelectedCustomer}
      />

      {selectedCustomer ? (
        <div className="flex flex-1 overflow-hidden divide-x divide-gray-200">
          <TicketsPane
            customer={selectedCustomer}
            tickets={tickets}
            statuses={statuses}
            onAddTicket={handleAddTicket}
          />
          <NotesPane
            customer={selectedCustomer}
            notes={notes}
            onAddNote={handleAddNote}
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
