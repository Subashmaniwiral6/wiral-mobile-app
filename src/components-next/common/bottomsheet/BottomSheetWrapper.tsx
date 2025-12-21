import React, { PropsWithChildren } from 'react';
import { BottomSheetView } from '@gorhom/bottom-sheet';

export const BottomSheetWrapper = (props: PropsWithChildren) => {
  const { children } = props;
  return (
    <BottomSheetView style={{ backgroundColor: '#808080', flex: 1 }}>
      {children}
    </BottomSheetView>
  );
};
