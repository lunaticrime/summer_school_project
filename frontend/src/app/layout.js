import './globals.css';

export const metadata = {
  title: 'AthenAI — Personalized Learning Path',
  description: 'AI-powered personalized learning path platform for students, teachers, and administrators. Detect skill gaps, generate targeted review plans, and track progress.',
  keywords: 'AI, education, personalized learning, skill gaps, learning path',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
