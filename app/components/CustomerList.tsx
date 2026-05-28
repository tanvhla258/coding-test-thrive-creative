"use client";

import { useState } from "react";
import type { Customer } from "@/types";

interface Props {
  customers: Customer[];
  selectedId: string | null;
  onSelect: (customer: Customer) => void;
}

const statusBadge: Record<Customer["status"], string> = {
  active: "bg-emerald-100 text-emerald-700",
  lead: "bg-blue-100 text-blue-700",
  inactive: "bg-gray-100 text-gray-500",
};

export default function CustomerList({ customers, selectedId, onSelect }: Props) {
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) =>
    c.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-72 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search by phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <nav className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            {search ? "No customers found" : "No customers to display."}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => onSelect(c)}
                  className={`w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors ${
                    selectedId === c.id ? "bg-indigo-50 border-r-2 border-indigo-500" : ""
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.company}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400">{c.phone}</p>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusBadge[c.status]}`}
                    >
                      {c.status}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}
