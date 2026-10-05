import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { Provider } from './provider';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['cyrillic', 'latin'],
});

export const metadata: Metadata = {
  title: 'ПДД Практика — интерактивный тренажёр',
  description: 'Образовательная онлайн-игра для изучения правил дорожного движения.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className={manrope.variable}><Provider>{children}</Provider></body>
    </html>
  );
}
