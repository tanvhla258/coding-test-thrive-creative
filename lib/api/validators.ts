import { z } from "zod";

export const CreateNoteSchema = z.object({
  customerId: z.string(),
  text: z.string().min(1),
  author: z.string().min(1),
});

export const PhoneFilterSchema = z.object({
  phone: z.string().optional(),
});

export const CustomerIdFilterSchema = z.object({
  customerId: z.string().optional(),
});

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type PhoneFilterInput = z.infer<typeof PhoneFilterSchema>;
export type CustomerIdFilterInput = z.infer<typeof CustomerIdFilterSchema>;
