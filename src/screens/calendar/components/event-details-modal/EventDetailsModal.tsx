import React, { useRef, useEffect } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { tailwind } from '@/theme';
import { BottomSheetBackdrop } from '@/components-next/common/bottomsheet/BottomSheetBackdrop';
import { EventDetailsView } from '../event-details-view/EventDetailsView';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color: string;
  link?: string;
  contact_person_name?: string;
  contact_person_phone_number?: string;
  customAttributes?: Record<string, any>;
}

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  onClose?: () => void;
}

export const EventDetailsModal = ({ event, onClose }: EventDetailsModalProps) => {
  const modalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (event) {
      // Small delay to ensure modal is mounted
      const timer = setTimeout(() => {
        modalRef.current?.present();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [event]);

  const handleDismiss = () => {
    onClose?.();
  };

  if (!event) {
    return null;
  }

  return (
    <BottomSheetModal
      ref={modalRef}
      backdropComponent={BottomSheetBackdrop}
      handleIndicatorStyle={tailwind.style('overflow-hidden w-8 h-1 rounded-[11px]')}
      handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
      style={tailwind.style('rounded-t-[26px] overflow-hidden')}
      enablePanDownToClose
      snapPoints={['70%']}
      enableDynamicSizing={false}
      onDismiss={handleDismiss}>
      <EventDetailsView event={event} onClose={handleDismiss} />
    </BottomSheetModal>
  );
};

