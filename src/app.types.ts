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
