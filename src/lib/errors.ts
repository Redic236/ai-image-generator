export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface FriendlyError {
  title: string;
  message: string;
}

export function friendlyError(err: unknown): FriendlyError {
  if (err instanceof ApiError) {
    switch (err.status) {
      case 400:
        return { title: '参数有误', message: err.message || '请检查提示词与尺寸后重试。' };
      case 401:
        return {
          title: 'API Key 无效',
          message: '请在「设置」中检查你的智谱 AI API Key 是否正确。',
        };
      case 403:
        return {
          title: '无权访问',
          message: '当前账号无权调用该模型，请确认模型是否已开通。',
        };
      case 408:
        return { title: '请求超时', message: '等待时间超过上限，请稍后再试或更换模型。' };
      case 429:
        return { title: '请求过于频繁', message: '触发了限流，请稍等片刻后再试。' };
      default:
        if (err.status >= 500) {
          return {
            title: '服务暂时不可用',
            message: '智谱 AI 服务或图片 CDN 出现异常，请稍后再试。',
          };
        }
        return { title: '请求失败', message: err.message || '请稍后重试。' };
    }
  }
  if (err instanceof Error && err.name === 'AbortError') {
    return { title: '已取消', message: '本次请求已中止。' };
  }
  if (err instanceof TypeError) {
    return {
      title: '网络请求失败',
      message: '可能是网络不通，或浏览器因 CORS 被阻止。请检查代理设置或网络连接。',
    };
  }
  return {
    title: '未知错误',
    message: err instanceof Error ? err.message : '请稍后重试。',
  };
}
