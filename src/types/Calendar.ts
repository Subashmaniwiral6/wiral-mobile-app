export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color: string;
  location?: string;
  meetLink?: string;
  contact_person_name?: string;
  contact_person_phone_number?: string;
  customAttributes?: Record<string, unknown>;
}
