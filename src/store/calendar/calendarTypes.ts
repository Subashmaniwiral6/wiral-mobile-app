export interface ConversationLabel {
  id: number;
  title: string;
  color: string;
  description: string;
  priority: number;
  show_on_sidebar: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomAttributeValue {
  value: string;
  attribute_display_name: string;
}

export interface AppointmentAPIResponse {
  id: number;
  scheduled_at: string;
  start_time: string;
  end_time: string;
  contact_id: number;
  contact_name: string;
  contact_phone: string;
  conversation_id: number;
  conversation_display_id: number;
  conversation_labels: ConversationLabel[];
  assigned_to_id: number;
  created_by_id: number;
  created_at: string;
  updated_at: string;
  custom_attributes: Record<string, CustomAttributeValue>;
}

export interface AppointmentResponse {
  payload: AppointmentAPIResponse[];
}
