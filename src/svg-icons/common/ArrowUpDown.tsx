import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from '../../types';

export const ArrowUpDownIcon = ({ stroke = '#858585' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 3L12 8L17 3M17 21L12 16L7 21"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
