import { LanguageCode } from './app.types';

interface I18nResources {
  greeting: string;
}
export const translations: Record<LanguageCode, I18nResources> = {
  'en-US': {
    greeting: 'Hi, This is call from ever young AI. How are you today?',
  },
  'zh-CN': {
    greeting: '你好，这是来自Ever young AI的电话。您今天好吗?',
  },
  'ja-JP': {
    greeting:
      'こんにちは、これはエバーヤングAIからの電話です。今日はいかがですか？',
  },
};
