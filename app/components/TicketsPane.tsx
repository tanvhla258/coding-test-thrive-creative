"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Customer, Ticket, TicketStatus } from "@/types";
import { CreateTicketSchema, type TicketFormData } from "@/lib/schemas";
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
  const [isOpen, setIsOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormData>({
    resolver: zodResolver(CreateTicketSchema),
    defaultValues: {
      subject: "",
      description: "",
      statusId: statuses[0]?.id ?? "",
    },
  });

  const openAdd = () => {
    reset({ subject: "", description: "", statusId: statuses[0]?.id ?? "" });
    setEditingTicket(null);
    setIsOpen(true);
  };

  const openEdit = (ticket: Ticket) => {
    reset({
      subject: ticket.subject,
      description: ticket.description ?? "",
      statusId: ticket.statusId,
    });
    setEditingTicket(ticket);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setEditingTicket(null);
    reset({ subject: "", description: "", statusId: statuses[0]?.id ?? "" });
  };

  const onSubmit = handleSubmit(async (data) => {
    if (editingTicket) {
      await onUpdateTicket(editingTicket.id, data.subject, data.description ?? "", data.statusId);
    } else {
      await onAddTicket(data.subject, data.description ?? "", data.statusId);
    }
    close();
  });

  return (
    <section className="flex flex-col w-1/2 overflow-hidden bg-gray-50">
      <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Tickets</h3>
        <Button size="xs" onClick={openAdd}>
          + New Ticket
        </Button>
      </div>

      {isOpen && (
        <Modal title={editingTicket ? "Edit Ticket" : "New Ticket"} onClose={close}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                {...register("subject")}
                placeholder="Short summary of the issue"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                {...register("description")}
                placeholder="Describe the ticket in detail"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                {...register("statusId")}
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
              <Button variant="ghost" size="sm" onClick={close}>
                Cancel
              </Button>
              <Button size="sm" disabled={isSubmitting}>
                {editingTicket ? "Update Ticket" : "Save Ticket"}
              </Button>
            </div>
          </form>
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
              <Button variant="link" onClick={() => openEdit(ticket)}>
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
