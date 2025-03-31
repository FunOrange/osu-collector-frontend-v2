export const metadata = {
  title: 'osu!Collector App',
  description: 'Find osu! beatmap collections and tournaments',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
