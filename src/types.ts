export type ImageSize =
  | '1024x1024'
  | '1344x768'
  | '1152x864'
  | '1440x720'
  | '768x1344'
  | '864x1152'
  | '720x1440';
export type ImageStyle =
  | 'realistic'
  | 'artistic'
  | 'anime'
  | 'oil'
  | 'watercolor'
  | 'cyberpunk'
  | 'chinese'
  | 'pixel'
  | '3d'
  | 'minimalist';
export type ImageModel = 'cogview-3-flash' | 'cogview-3-plus' | 'cogview-4';

export interface Settings {
  apiKey: string;
  model: ImageModel;
}

export interface GenerateParams {
  prompt: string;
  size: ImageSize;
  style: ImageStyle;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  size: ImageSize;
  style: ImageStyle;
  imageUrl: string;
  createdAt: number;
}

export type BatchCount = 1 | 2 | 4;

/** Narrow any number to a valid BatchCount. Falls back to 1 (safe default)
 *  for anything out of range — including the pathological case of a tiles
 *  array that was mutated to length 3 or 5 by some future bug. */
export function asBatchCount(n: number): BatchCount {
  if (n === 1 || n === 2 || n === 4) return n;
  return 1;
}

export type BatchTile =
  | { tileId: string; status: 'loading' }
  | { tileId: string; status: 'image'; item: HistoryItem }
  | { tileId: string; status: 'error'; title: string; message: string };

export type DisplayState =
  | { type: 'empty' }
  | { type: 'batch'; params: GenerateParams; tiles: BatchTile[] };
