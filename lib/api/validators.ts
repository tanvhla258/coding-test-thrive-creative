import { z } from "zod";

export const CustomerQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email format"),
  company: z.string().min(1, "Company is required"),
  status: z.enum(["active", "lead", "inactive"]).default("active"),
});

export const UpdateCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  phone: z.string().min(1, "Phone is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  company: z.string().min(1, "Company is required").optional(),
  status: z.enum(["active", "lead", "inactive"]).optional(),
});

export const CreateNoteSchema = z.object({
  text: z.string().min(1, "Text is required"),
  author: z.string().min(1, "Author is required"),
});

export const UpdateNoteSchema = z.object({
  text: z.string().min(1, "Text is required").optional(),
  author: z.string().min(1, "Author is required").optional(),
});

export const CreateTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  statusId: z.string().min(1, "Status ID is required"),
});

export const UpdateTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required").optional(),
  description: z.string().optional(),
  statusId: z.string().min(1, "Status ID is required").optional(),
});
