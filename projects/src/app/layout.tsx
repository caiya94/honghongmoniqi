import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: {
    default: '哄哄模拟器 | 你能把TA哄好吗？',
    template: '%s | 哄哄模拟器',
  },
  description:
    '情侣互动游戏：AI扮演生气的对象，你需要在10轮内把TA哄好。选择正确的对话选项，展现你的情商！',
  keywords: [
    '哄哄模拟器',
    '情侣游戏',
    '情商训练',
    '对话游戏',
    '模拟器',
  ],
  authors: [{ name: 'Coze Coding' }],
  openGraph: {
    title: '哄哄模拟器 | 你能把TA哄好吗？',
    description: '情侣互动游戏：AI扮演生气的对象，你需要在10轮内把TA哄好。',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
