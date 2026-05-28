"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Customer, Note } from "@/types";
import Modal from "./Modal";
import Button from "./Button";

interface Props {
  customer: Customer;
  notes: Note[];
  onAddNote: (text: string, author: string) => Promise<void>;
  onUpdateNote: (noteId: string, text: string, author: string) => Promise<void>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function NotesPane({ customer, notes, onAddNote, onUpdateNote }: Props) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [editText, setEditText] = useState("");
  const [editAuthor, setEditAuthor] = useState("");

  const closeModal = () => {
    setOpen(false);
    setText("");
    setAuthor("");
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setEditText(note.text);
    setEditAuthor(note.author);
    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);
    setEditingNote(null);
    setEditText("");
    setEditAuthor("");
  };

  return (
    <section className="flex flex-col flex-1 overflow-hidden bg-gray-50">
      <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Notes</h3>
        <Button size="xs" onClick={() => setOpen(true)}>
          + Add Note
        </Button>
      </div>

      {open && (
        <Modal title="Add Note" onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your note here..."
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={closeModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={async () => {
                  if (!text.trim()) {
                    toast.warning("Note text is required");
                    return;
                  }
                  if (!author.trim()) {
                    toast.warning("Author is required");
                    return;
                  }
                  await onAddNote(text, author);
                  closeModal();
                }}>
                Save Note
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {editOpen && editingNote && (
        <Modal title="Edit Note" onClose={closeEditModal}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Write your note here..."
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                value={editAuthor}
                onChange={(e) => setEditAuthor(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={async () => {
                  if (!editText.trim()) {
                    toast.warning("Note text is required");
                    return;
                  }
                  if (!editAuthor.trim()) {
                    toast.warning("Author is required");
                    return;
                  }
                  await onUpdateNote(editingNote.id, editText, editAuthor);
                  closeEditModal();
                }}>
                Update Note
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-sm">No notes yet. Add the first one below.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm text-gray-800 leading-relaxed">{note.text}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span className="font-medium text-gray-500">{note.author}</span>
                <div className="flex items-center gap-2">
                  <span>{formatDate(note.createdAt)}</span>
                  <Button variant="link" onClick={() => openEditModal(note)}>
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </section>
  );
}
