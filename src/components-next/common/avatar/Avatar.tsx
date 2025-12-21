import React, { useState } from 'react';
import {
  ImageProps,
  ImageSourcePropType,
  ImageURISource,
  Text,
  View,
  ViewProps,
} from 'react-native';

import { avatarTheme, tailwind } from '@/theme';
import { Channel } from '@/types';
import { cx, styleAdapter } from '@/utils';

import { AvatarImage } from './AvatarImage';
import { AvatarStatus } from './AvatarStatus';

export type AvatarSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type AvatarStatusType = 'online' | 'away' | 'offline' | 'typing';

export const removeEmoji = (text: string) => {
  if (text) {
    return text
      .replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        '',
      )
      .replace(/\s+/g, ' ')
      .trim();
  }
  return '';
};

function getInitials(name: string, size: AvatarSizes) {
  const userNameWithoutEmoji = removeEmoji(name).trimStart();
  if (!userNameWithoutEmoji) {
    return;
  }
  const [firstName, lastName] = userNameWithoutEmoji.split(' ');
  const oneLetterInitialSizes = ['xs', 'sm', 'md'];
  const initials =
    firstName && lastName
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`
      : `${firstName.charAt(0)}${firstName.charAt(1)}`;

  return oneLetterInitialSizes.includes(size)
    ? initials.toUpperCase().charAt(0)
    : initials.toUpperCase();
}

// Generate a light colorful background color based on the name
function getColorfulBackground(name: string): string {
  if (!name) return '#A78BFA'; // Default light purple color
  
  // Light colorful colors palette (pastel colors)
  const colors = [
    '#A78BFA', // Light Purple
    '#93C5FD', // Light Blue
    '#86EFAC', // Light Green
    '#FCA5A5', // Light Red/Pink
    '#FCD34D', // Light Yellow/Orange
    '#C4B5FD', // Light Lavender
    '#7DD3FC', // Light Sky Blue
    '#F9A8D4', // Light Pink
    '#6EE7B7', // Light Mint
    '#FBBF24', // Light Amber
    '#FDB88C', // Light Peach
    '#A5F3FC', // Light Cyan
  ];
  
  // Simple hash function to get consistent color for the same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export interface AvatarProps extends ViewProps {
  /**
   * React Native Image component Props, except for source
   */
  imageProps: Omit<ImageProps, 'source'>;
  /**
   * The image source (either a remote URL or a local file resource).
   * Check https://reactnative.dev/docs/image#imagesource
   */
  src: ImageSourcePropType;
  /**
   * How large should avatar be?
   *
   * @default xl
   */
  size: AvatarSizes;
  /**
   * If `true`, Avatar looks like a squared.
   *
   * @default false
   */
  squared: boolean;
  /**
   * Name prop used for `alt` & calculate placeholder initials.
   */
  name: string;
  /**
   * Shows AvatarBadge with the given type
   *
   * @default none
   */
  status: AvatarStatusType;
  /**
   * StatusIndicator's Background Color & StatusIndicator Ring Color.
   *
   * @default "text-white"
   */
  parentsBackground: string;
  /**
   * The Avatar Channel Indicator, more likely for
   */
  channel: Channel;
}

export const Avatar: React.FC<Partial<AvatarProps>> = props => {
  const {
    size = 'xl',
    squared = false,
    name,
    src,
    status,
    parentsBackground = 'text-white',
    imageProps = {},
    channel,
    style,
    ...boxProps
  } = props;

  const isSquared = squared;
  const isSourceAvailable = !!src;

  const [imageAvailable, setImageAvailable] = useState(isSourceAvailable);
  const loadFallback = () => setImageAvailable(false);

  // Get colorful background when there's no image
  const backgroundColor = !imageAvailable && name ? getColorfulBackground(name) : undefined;

  return (
    <View
      style={[
        avatarTheme.borderRadius.size[size],
        tailwind.style(
          cx(avatarTheme.base, avatarTheme.size[size], !isSquared ? avatarTheme.circular : ''),
        ),
        styleAdapter(style),
        backgroundColor ? { backgroundColor } : {},
      ]}
      {...boxProps}>
      {imageAvailable && src ? (
        <AvatarImage
          size={size}
          imageProps={imageProps}
          src={src as ImageURISource}
          squared={isSquared}
          handleFallback={loadFallback}
        />
      ) : name ? (
        <Text
          style={[
            tailwind.style(
              cx(
                avatarTheme.initials.base,
                avatarTheme.initials.size[size],
                'font-inter-medium-24',
              ),
            ),
            { color: '#FFFFFF' }, // White text for visibility on colorful backgrounds
          ]}
          adjustsFontSizeToFit
          allowFontScaling={false}>
          {getInitials(name, size)}
        </Text>
      ) : null}
      {status && <AvatarStatus parentsBackground={parentsBackground} size={size} status={status} />}
    </View>
  );
};
