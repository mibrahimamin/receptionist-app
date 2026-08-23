export type Business = {

  id: string;

  slug: string;

  name: string;

  tagline: string;

  greeting: string;

  timezone: string;

  phone: string | null;

  email: string | null;

  address: string | null;

  passcode_hash: string | null;

  slot_interval_minutes: number;

};

export type BusinessHour = {
  id: string;
  business_id: string;
  day_of_week: number; // 0 = Sunday
  is_closed: boolean;
  open_time: string; // 'HH:MM:SS'
  close_time: string;
};

export type Service = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  buffer_minutes: number;
  is_active: boolean;
  sort_order: number;
};

export type Faq = {
  id: string;
  business_id: string;
  question: string;
  keywords: string;
  answer: string;
  sort_order: number;
};

export type Contact = {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: "chat" | "booking";
  created_at: string;
  status: string;
};

export type Appointment = {
  id: string;
  business_id: string;
  contact_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: "confirmed" | "cancelled" | "completed";
  notes: string | null;
  created_at: string;
};

export type AppointmentWithDetails = Appointment & {
  contact: Pick<Contact, "name" | "email" | "phone">;
  service: Pick<Service, "name" | "duration_minutes">;
};
