import type { ImageModel, ImageSize, ImageStyle } from '../types';

export const STYLE_LABEL: Record<ImageStyle, string> = {
  realistic: '写实风格',
  artistic: '艺术风格',
};

export const SIZE_OPTIONS: ReadonlyArray<{ value: ImageSize; label: string }> = [
  { value: '1024x1024', label: '正方形' },
  { value: '1344x768', label: '横版' },
  { value: '768x1344', label: '竖版' },
];

export const STYLE_OPTIONS: ReadonlyArray<{
  value: ImageStyle;
  label: string;
  desc: string;
}> = [
  { value: 'realistic', label: '写实风格', desc: '照片级真实感' },
  { value: 'artistic', label: '艺术风格', desc: '绘画 / 插画感' },
];

export const MODEL_OPTIONS: ReadonlyArray<{ value: ImageModel; label: string }> = [
  { value: 'cogview-3-flash', label: 'CogView-3-Flash · 免费' },
  { value: 'cogview-3-plus', label: 'CogView-3-Plus · 质量更高' },
  { value: 'cogview-4', label: 'CogView-4 · 旗舰' },
];
