import type { ImageModel, ImageSize, ImageStyle } from '../types';

export interface StylePreset {
  value: ImageStyle;
  label: string;
  emoji: string;
  /** Tailwind gradient classes — rendered on the emoji badge */
  gradient: string;
  /** Appended to the user's prompt before calling the image API */
  suffix: string;
}

/** Single source of truth for style presets.
 *  Used by PromptCard (render), DisplayCard meta, and zhipu service (prompt injection). */
export const STYLES: ReadonlyArray<StylePreset> = [
  {
    value: 'realistic',
    label: '写实',
    emoji: '📷',
    gradient: 'from-blue-500 to-cyan-400',
    suffix: '，写实风格，照片级真实感，光线自然，细节丰富，高分辨率',
  },
  {
    value: 'artistic',
    label: '艺术插画',
    emoji: '🎨',
    gradient: 'from-pink-500 to-rose-400',
    suffix: '，艺术插画风格，绘画质感，富有表现力的色彩与笔触',
  },
  {
    value: 'anime',
    label: '动漫',
    emoji: '🌸',
    gradient: 'from-pink-400 to-purple-500',
    suffix: '，日式动漫风格，精致线条，鲜艳色彩，赛璐璐上色，大眼人物',
  },
  {
    value: 'oil',
    label: '油画',
    emoji: '🖼️',
    gradient: 'from-orange-500 to-amber-600',
    suffix: '，古典油画风格，浓郁笔触，油彩质感，画布纹理，伦勃朗光',
  },
  {
    value: 'watercolor',
    label: '水彩',
    emoji: '💧',
    gradient: 'from-sky-400 to-teal-400',
    suffix: '，水彩画风格，柔和晕染，通透色彩，纸张质感，手绘感',
  },
  {
    value: 'cyberpunk',
    label: '赛博朋克',
    emoji: '🌃',
    gradient: 'from-fuchsia-500 to-indigo-600',
    suffix: '，赛博朋克风格，霓虹灯光，雨夜都市，高对比色彩，未来科技感',
  },
  {
    value: 'chinese',
    label: '中国风',
    emoji: '🏯',
    gradient: 'from-red-600 to-amber-700',
    suffix: '，中国水墨画风格，写意构图，淡雅色调，传统意境，大量留白',
  },
  {
    value: 'pixel',
    label: '像素艺术',
    emoji: '👾',
    gradient: 'from-emerald-500 to-lime-500',
    suffix: '，像素艺术风格，8-bit 复古游戏感，方格色块，低分辨率美学',
  },
  {
    value: '3d',
    label: '3D 渲染',
    emoji: '🎮',
    gradient: 'from-violet-500 to-fuchsia-500',
    suffix: '，3D 渲染风格，Octane 级材质，物理光照，景深，次表面散射',
  },
  {
    value: 'minimalist',
    label: '极简',
    emoji: '◻️',
    gradient: 'from-slate-400 to-gray-500',
    suffix: '，极简主义风格，干净构图，大面积留白，克制配色，几何感',
  },
];

export const STYLE_LABEL: Record<ImageStyle, string> = Object.fromEntries(
  STYLES.map((s) => [s.value, s.label])
) as Record<ImageStyle, string>;

export const STYLE_SUFFIX: Record<ImageStyle, string> = Object.fromEntries(
  STYLES.map((s) => [s.value, s.suffix])
) as Record<ImageStyle, string>;

export const SIZE_OPTIONS: ReadonlyArray<{ value: ImageSize; label: string }> = [
  { value: '1024x1024', label: '1:1' },
  { value: '1344x768', label: '16:9' },
  { value: '1152x864', label: '4:3' },
  { value: '1440x720', label: '2:1' },
  { value: '768x1344', label: '9:16' },
  { value: '864x1152', label: '3:4' },
  { value: '720x1440', label: '1:2' },
];

export const MODEL_OPTIONS: ReadonlyArray<{ value: ImageModel; label: string }> = [
  { value: 'cogview-3-flash', label: 'CogView-3-Flash · 免费' },
  { value: 'cogview-3-plus', label: 'CogView-3-Plus · 质量更高' },
  { value: 'cogview-4', label: 'CogView-4 · 旗舰' },
];
