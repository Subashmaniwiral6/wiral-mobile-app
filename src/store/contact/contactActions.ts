import { createAsyncThunk } from '@reduxjs/toolkit';
import { ContactService } from './contactService';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/store/conversation/conversationTypes';

import { ContactLabelsPayload, ContactResponse } from './contactTypes';

export const contactActions = {
  getContactLabels: createAsyncThunk<
    {
      contactId: number;
      labels: string[];
    },
    ContactLabelsPayload
  >('contact/getContactLabels', async (payload, { rejectWithValue }) => {
    try {
      const response = await ContactService.getContactLabels(payload);
      const { payload: labels } = response.data;
      return { contactId: payload.contactId, labels };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      return rejectWithValue(message);
    }
  }),
  fetchContact: createAsyncThunk<ContactResponse, number>(
    'contact/fetchContact',
    async (contactId, { rejectWithValue }) => {
      try {
        return await ContactService.getContact(contactId);
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
};
