import "../styles/globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Tickets App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
