import "./globals.css"; // O tus estilos globales

export const metadata = {
  title: "QA Test Lab",
  description: "Tu espacio de pruebas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}