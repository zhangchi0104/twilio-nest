import { ChatCompletionMessageParam } from 'openai/resources';

export enum SessionStatus {
  DIALED = 'dialed',
  PENDING_FOR_MORE_INFO = 'pending-for-more-info',
  COMPLETED = 'completed',
}
export interface SessionState {
  status: SessionStatus;
  chatHistory: ChatCompletionMessageParam[];
}

export enum LanguageCode {
  ZH_CN = 'zh-CN',
  en_US = 'en-US',
  JA_JP = 'ja-JP',
}
