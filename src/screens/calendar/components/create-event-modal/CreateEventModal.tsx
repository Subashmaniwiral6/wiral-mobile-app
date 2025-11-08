import React, { useRef, useEffect } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { tailwind } from '@/theme';
import { BottomSheetBackdrop } from '@/components-next/common/bottomsheet/BottomSheetBackdrop';
import { CreateEventForm } from '../create-event-form/CreateEventForm';

interface CreateEventModalProps {
  onClose?: () => void;
  onSave?: (event: {
    title: string;
    startTime: Date;
    endTime: Date;
    color: string;
    link?: string;
  }) => void;
}

export const CreateEventModal = ({ onClose, onSave }: CreateEventModalProps) => {
  const modalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    // Small delay to ensure modal is mounted
    const timer = setTimeout(() => {
      modalRef.current?.present();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    onClose?.();
  };

  const handleSave = (event: {
    title: string;
    startTime: Date;
    endTime: Date;
    color: string;
    link?: string;
  }) => {
    onSave?.(event);
    modalRef.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={modalRef}
      backdropComponent={BottomSheetBackdrop}
      handleIndicatorStyle={tailwind.style('overflow-hidden w-8 h-1 rounded-[11px]')}
      handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
      style={tailwind.style('rounded-t-[26px] overflow-hidden')}
      enablePanDownToClose
      snapPoints={['85%']}
      enableDynamicSizing={false}
      onDismiss={handleDismiss}>
      <CreateEventForm onSave={handleSave} onCancel={handleDismiss} />
    </BottomSheetModal>
  );
};

