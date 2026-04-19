export type ImageSize = '1024x1024' | '1344x768' | '768x1344';
export type ImageStyle = 'realistic' | 'artistic';
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

export type DisplayState =
  | { type: 'empty' }
  | { type: 'loading' }
  | { type: 'image'; item: HistoryItem }
  | { type: 'error'; title: string; message: string };
