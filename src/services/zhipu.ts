import { ApiError } from '../lib/errors';
import { STYLE_LABEL, STYLE_SUFFIX } from '../lib/constants';
import type { GenerateParams, ImageModel, ImageStyle } from '../types';

const IMAGE_API_URL = 'https://open.bigmodel.cn/api/paas/v4/images/generations';
const CHAT_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const CHAT_MODEL = 'glm-4-flash';

const GENERATE_TIMEOUT_MS = 90_000;
const OPTIMIZE_TIMEOUT_MS = 30_000;

const OPTIMIZE_SYSTEM_PROMPT = `你是专业的 AI 文生图提示词工程师。用户会给你一段简短的画面描述，请你把它扩写成一条高质量的中文文生图提示词。

输出要求：
1. 必须自然融入以下要素，不要分条列出：
   - 主体：画面中的核心对象，及其状态、动作、服饰或特征
   - 场景：环境、背景、氛围
   - 风格：整体视觉风格（结合用户提供的风格倾向）
   - 光线：光源类型、方向、强度、氛围感
   - 色彩：主色调与色彩情绪
   - 构图：视角、景别、前后景关系
2. 忠于用户原始意图，不要无中生有新的主体或故事
3. 使用中文逗号分隔的短语组合，语言精炼，整体控制在 80-150 字
4. 直接输出最终提示词正文，不要任何前缀、编号、解释、引号或 Markdown 格式`;

export interface GenerateImageInput extends GenerateParams {
  apiKey: string;
  model: ImageModel;
}

export interface GenerateImageResult {
  url: string;
  fullPrompt: string;
}

export async function generateImage({
  prompt,
  size,
  style,
  apiKey,
  model,
}: GenerateImageInput): Promise<GenerateImageResult> {
  const fullPrompt = prompt.trim() + STYLE_SUFFIX[style];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('timeout'), GENERATE_TIMEOUT_MS);

  try {
    const response = await fetch(IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, prompt: fullPrompt, size }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.json().catch(() => null);
      const message =
        detail?.error?.message || detail?.msg || response.statusText || `HTTP ${response.status}`;
      throw new ApiError(response.status, message);
    }

    const data = await response.json();
    const url: string | undefined = data?.data?.[0]?.url;
    if (!url) throw new ApiError(502, '返回数据格式异常，未找到图片 URL');
    return { url, fullPrompt };
  } catch (err) {
    if (
      err instanceof Error &&
      err.name === 'AbortError' &&
      controller.signal.reason === 'timeout'
    ) {
      throw new ApiError(408, '请求超时');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface OptimizePromptInput {
  prompt: string;
  style: ImageStyle;
  apiKey: string;
}

export async function optimizePrompt({
  prompt,
  style,
  apiKey,
}: OptimizePromptInput): Promise<string> {
  const userMessage = `用户原始描述：\n${prompt}\n\n用户选择的风格倾向：${STYLE_LABEL[style]}\n\n请直接输出优化后的提示词。`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('timeout'), OPTIMIZE_TIMEOUT_MS);

  try {
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature: 0.7,
        messages: [
          { role: 'system', content: OPTIMIZE_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.json().catch(() => null);
      const message =
        detail?.error?.message || detail?.msg || response.statusText || `HTTP ${response.status}`;
      throw new ApiError(response.status, message);
    }

    const data = await response.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) throw new ApiError(502, '返回数据格式异常，未找到优化结果');
    return content
      .trim()
      .replace(/^```[\w-]*\n?|\n?```$/g, '')
      .replace(/^["'"'「『]+|["'"'」』]+$/g, '')
      .trim();
  } catch (err) {
    if (
      err instanceof Error &&
      err.name === 'AbortError' &&
      controller.signal.reason === 'timeout'
    ) {
      throw new ApiError(408, '优化请求超时');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
