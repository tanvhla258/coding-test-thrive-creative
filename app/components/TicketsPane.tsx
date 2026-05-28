"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Customer, Ticket, TicketStatus } from "@/types";
import Modal from "./Modal";
import Button from "./Button";

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
  tickets: Ticket[];
  statuses: TicketStatus[];
  onAddTicket: (subject: string, description: string, statusId: string) => void;
  onUpdateTicket: (ticketId: string, subject: string, description: string, statusId: string) => void;
}

export default function TicketsPane({ customer, tickets, statuses, onAddTicket, onUpdateTicket }: Props) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [statusId, setStatusId] = useState(statuses[0]?.id ?? "");
  const [editSubject, setEditSubject] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatusId, setEditStatusId] = useState(statuses[0]?.id ?? "");

  const closeModal = () => {
    setOpen(false);
    setSubject("");
    setDescription("");
    setStatusId(statuses[0]?.id ?? "");
  };

  const openEditModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setEditSubject(ticket.subject);
    setEditDescription(ticket.description ?? "");
    setEditStatusId(ticket.statusId);
    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);
    setEditingTicket(null);
    setEditSubject("");
    setEditDescription("");
    setEditStatusId(statuses[0]?.id ?? "");
  };

  return (
    <section className="flex flex-col w-1/2 overflow-hidden bg-gray-50">
      <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Tickets</h3>
        <Button size="xs" onClick={() => setOpen(true)}>
          + New Ticket
        </Button>
      </div>

      {open && (
        <Modal title="New Ticket" onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={closeModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={async () => {
                  if (!subject.trim()) {
                    toast.warning("Subject is required");
                    return;
                  }
                  if (!description.trim()) {
                    toast.warning("Description is required");
                    return;
                  }
                  await onAddTicket(subject, description, statusId);
                  closeModal();
                }}>
                Save Ticket
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {editOpen && editingTicket && (
        <Modal title="Edit Ticket" onClose={closeEditModal}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                placeholder="Short summary of the issue"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Describe the ticket in detail"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={editStatusId}
                onChange={(e) => setEditStatusId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={async () => {
                  if (!editSubject.trim()) {
                    toast.warning("Subject is required");
                    return;
                  }
                  if (!editDescription.trim()) {
                    toast.warning("Description is required");
                    return;
                  }
                  await onUpdateTicket(editingTicket.id, editSubject, editDescription, editStatusId);
                  closeEditModal();
                }}>
                Update Ticket
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-900 leading-snug">{ticket.subject}</p>
              <span className={`flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${colorMap[ticket.status.color] ?? ""}`}>
                {ticket.status.name}
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">{ticket.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <Button variant="link" onClick={() => openEditModal(ticket)}>
                Edit
              </Button>
              <span>{formatDate(ticket.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
