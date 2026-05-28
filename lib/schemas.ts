export {
  CreateNoteSchema,
  UpdateNoteSchema,
  CreateTicketSchema,
  UpdateTicketSchema,
} from "./api/validators";

export type NoteFormData = {
  text: string;
  author: string;
};

export type TicketFormData = {
  subject: string;
  description?: string;
  statusId: string;
};
