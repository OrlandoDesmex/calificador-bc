import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Calificador BC — Desmex',
  description: 'Precalificación de prospectos para Bombas de Calor',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
