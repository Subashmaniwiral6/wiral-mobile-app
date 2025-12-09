import { apiService } from '@/services/APIService';
import type { AppointmentResponse } from './calendarTypes';

export interface AppointmentParams {
  start_at: string;
  end_at: string;
}

export class CalendarService {
  static async getAppointments(params: AppointmentParams): Promise<AppointmentResponse> {
    const response = await apiService.get<AppointmentResponse>('calendars/appointments', {
      params: {
        start_at: params.start_at,
        end_at: params.end_at,
      },
    });
    return response.data;
  }
}
