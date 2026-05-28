"use client";

import { useState } from "react";
import type { Customer } from "@/types";
import Modal from "./Modal";

interface ShellTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  statusColor: string;
  author: string;
  createdAt: string;
}

const SHELL_TICKETS: ShellTicket[] = [
  {
    id: "st_1",
    title: "Shell Ticket — Wire up real data",
    description: "This is a placeholder ticket. Fetch real tickets from your API and render them here.",
    status: "Open",
    statusColor: "blue",
    author: "Shell User",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "st_2",
    title: "Another Placeholder Ticket",
    description: "Replace these shell records with tickets from the database filtered by customerId.",
    status: "In Progress",
    statusColor: "yellow",
    author: "Shell User",
    createdAt: "2024-01-16T14:30:00Z",
  },
  {
    id: "st_3",
    title: "Third Example Ticket",
    description: "Tickets should have a title, description, status, author, and date at minimum.",
    status: "Resolved",
    statusColor: "green",
    author: "Shell User",
    createdAt: "2024-01-17T09:15:00Z",
  },
];

const colorMap: Record<string, string> = {
  blue:   "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  orange: "bg-orange-100 text-orange-700",
  green:  "bg-green-100 text-green-700",
  gray:   "bg-gray-100 text-gray-500",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

interface Props {
  customer: Customer;
}

export default function TicketsPane({ customer }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Open");
  const [author, setAuthor] = useState("");

  const closeModal = () => {
    setOpen(false);
    setTitle("");
    setDescription("");
    setStatus("Open");
    setAuthor("");
  };

  return (
    <section className="flex flex-col w-1/2 overflow-hidden bg-gray-50">
      <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Tickets</h3>
        <button
          onClick={() => setOpen(true)}
          className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Ticket
        </button>
      </div>

      {open && (
        <Modal title="New Ticket" onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short summary of the issue"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the ticket in detail"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Waiting on Customer</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Ticket
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {SHELL_TICKETS.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-900 leading-snug">{ticket.title}</p>
              <span className={`flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${colorMap[ticket.statusColor]}`}>
                {ticket.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">{ticket.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-medium text-gray-500">{ticket.author}</span>
              <span>{formatDate(ticket.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
