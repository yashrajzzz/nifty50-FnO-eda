import React from 'react';

export interface SplitFlapTextProps {
  words?: string[];
  text?: string;
  flipDuration?: number;
  stagger?: number;
  cycleDelay?: number;
  charset?: 'alpha' | 'alphanumeric' | 'numeric' | string;
  flipsPerChar?: number;
  tileColor?: string;
  textColor?: string;
  tileRadius?: number;
  gap?: number;
  fontSize?: number | string;
  loop?: boolean;
  padTo?: number;
  align?: 'left' | 'center' | 'right';
  intro?: boolean;
  glare?: number;
  depth?: number;
  order?: 'left' | 'right' | 'random';
  tileStyle?: 'board' | 'minimal';
  className?: string;
  style?: React.CSSProperties;
  onWordChange?: (index: number, word: string) => void;
  onComplete?: () => void;
  [key: string]: any;
}

declare const SplitFlapText: React.FC<SplitFlapTextProps>;
export default SplitFlapText;
