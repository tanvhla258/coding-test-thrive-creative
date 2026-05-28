"use client";

import { useState, useEffect } from "react";
import type { Customer, Note } from "@/types";
import CustomerList from "./components/CustomerList";
import NotesPane from "./components/NotesPane";
import TicketsPane from "./components/TicketsPane";
import EmptyState from "./components/EmptyState";

// ---------------------------------------------------------------------------
// SHELL DATA — replace these with real API calls
// This data is intentionally different from /data/ so you know when you've
// wired up the real endpoints correctly.
// ---------------------------------------------------------------------------
const SHELL_CUSTOMERS: Customer[] = [
  { id: "shell_1", name: "Jane Doe",      phone: "555-000-0001", email: "jane@example.com",   company: "Example Co",      status: "active"   },
  { id: "shell_2", name: "Bob Smith",     phone: "555-000-0002", email: "bob@placeholder.com", company: "Placeholder Inc", status: "lead"     },
  { id: "shell_3", name: "Alice Johnson", phone: "555-000-0003", email: "alice@sample.org",    company: "Sample Corp",     status: "inactive" },
];

const SHELL_NOTES: Note[] = [
  { id: "sn_1", customerId: "shell_1", text: "Shell note — replace with data from /api/notes.", createdAt: "2024-01-10T09:00:00Z", author: "Shell User" },
  { id: "sn_2", customerId: "shell_1", text: "Another placeholder note. Wire up the API!",      createdAt: "2024-01-11T14:30:00Z", author: "Shell User" },
];

// ---------------------------------------------------------------------------

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>(SHELL_CUSTOMERS);
  const [notes, setNotes]         = useState<Note[]>(SHELL_NOTES);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    // TODO: replace shell data — fetch real customers from your API
    // fetch("/api/customers").then((r) => r.json()).then(setCustomers);
  }, []);

  useEffect(() => {
    if (!selectedCustomer) return;
    // TODO: fetch real notes for the selected customer
    // fetch(`/api/notes?customerId=${selectedCustomer.id}`).then((r) => r.json()).then(setNotes);
  }, [selectedCustomer]);

  const handleAddNote = async (text: string) => {
    if (!selectedCustomer) return;
    // TODO: POST to /api/notes with { customerId, text, author }
    // TODO: refresh notes after successful save
    console.log("TODO: save note", { customerId: selectedCustomer.id, text });
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="flex-shrink-0 h-14 bg-indigo-700 flex items-center px-6 shadow-md">
        <h1 className="text-white font-bold text-lg tracking-tight">Customer Notes</h1>
        <span className="ml-3 text-indigo-300 text-xs font-medium bg-indigo-800 px-2 py-0.5 rounded-full">
          CRM
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <CustomerList
          customers={customers}
          selectedId={selectedCustomer?.id ?? null}
          onSelect={setSelectedCustomer}
        />

        {selectedCustomer ? (
          <div className="flex flex-1 overflow-hidden divide-x divide-gray-200">
            <TicketsPane customer={selectedCustomer} />
            <NotesPane
              customer={selectedCustomer}
              notes={notes}
              onAddNote={handleAddNote}
            />
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
