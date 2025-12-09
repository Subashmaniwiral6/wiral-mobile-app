import type { AppointmentAPIResponse } from './calendarTypes';
import type { CalendarEvent } from '@/types/Calendar';

/**
 * Generates a consistent random color based on an ID
 * This ensures the same appointment always gets the same color
 */
function generateColorFromId(id: number | string): string {
  // Predefined palette of attractive colors
  const colors = [
    '#4285F4', // Blue
    '#34A853', // Green
    '#FBBC04', // Yellow
    '#EA4335', // Red
    '#9C27B0', // Purple
    '#FF9800', // Orange
    '#00BCD4', // Cyan
    '#E91E63', // Pink
    '#4CAF50', // Light Green
    '#2196F3', // Light Blue
    '#FF5722', // Deep Orange
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#009688', // Teal
    '#3F51B5', // Indigo
    '#F44336', // Red
    '#FFC107', // Amber
    '#8BC34A', // Light Green
    '#FF4081', // Pink
    '#00E676', // Green
  ];

  // Convert ID to number and use modulo to get consistent color
  const idNum = typeof id === 'string' ? parseInt(id, 10) || 0 : id;
  const colorIndex = Math.abs(idNum) % colors.length;
  return colors[colorIndex];
}

/**
 * Transforms an appointment from the API response to a CalendarEvent
 */
export function transformAppointmentToCalendarEvent(
  appointment: AppointmentAPIResponse,
): CalendarEvent {
  // Combine scheduled_at with start_time and end_time to create full Date objects
  const startDateTime = new Date(`${appointment.scheduled_at}T${appointment.start_time}`);
  const endDateTime = new Date(`${appointment.scheduled_at}T${appointment.end_time}`);

  // Extract custom attributes, excluding contact_name and contact_phone which are handled separately
  const customAttributes: Record<string, unknown> = {};
  if (appointment.custom_attributes) {
    Object.keys(appointment.custom_attributes).forEach(key => {
      const attr = appointment.custom_attributes[key];
      if (attr && typeof attr === 'object' && 'value' in attr) {
        customAttributes[key] = attr.value;
      }
    });
  }

  // Generate a random but consistent color based on appointment ID
  const color = generateColorFromId(appointment.id);

  // Create title from contact name or use a default
  const title = appointment.contact_name || `Appointment #${appointment.id}`;

  return {
    id: appointment.id.toString(),
    title,
    startTime: startDateTime,
    endTime: endDateTime,
    color,
    contact_person_name: appointment.contact_name,
    contact_person_phone_number: appointment.contact_phone,
    customAttributes,
  };
}
