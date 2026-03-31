import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'TaskNest',
  description: 'Kanban task manager',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TaskNest" />
      </head>
      <body className="min-h-screen antialiased">
        <div className="gradient-overlay pointer-events-none fixed inset-0" style={{ background: 'var(--gradient-overlay)' }} />
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(){});
                });
              }

              try {
                var t = localStorage.getItem('theme');
                if (t === 'light') {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch(e) {}
            `,
          }}
        />
      </body>
    </html>
  );
}
