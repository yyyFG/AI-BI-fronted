// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** streamChat POST /api/ai/stream */
export async function streamChatUsingPost(body: API.ChatRequest, options?: { [key: string]: any }) {
  return request<API.StreamingResponseBody>('/api/ai/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    responseType: 'stream',  // 关键配置
    getResponse: true,       // 获取完整响应对象
    ...(options || {}),
  });
}
