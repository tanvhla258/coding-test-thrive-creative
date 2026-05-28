export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  status: "active" | "lead" | "inactive";
}

export interface Note {
  id: string;
  customerId: string;
  text: string;
  createdAt: string;
  author: string;
}

export interface TicketStatus {
  id: string;
  name: string;
  color: "blue" | "yellow" | "orange" | "green" | "gray";
}

export interface Ticket {
  id: string;
  customerId: string;
  subject: string;
  description: string | null;
  statusId: string;
  createdAt: string;
  updatedAt: string;
  status: {
    id: string;
    name: string;
    color: string;
  };
}
