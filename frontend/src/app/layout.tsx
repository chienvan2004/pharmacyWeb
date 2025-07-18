import { Toaster } from 'react-hot-toast';
import './globals.css';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en"
        katalonextensionid="hdodkejagjkdomgbiioijegfmiiknoam"
      >
        <body>
          {children}
          <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
        </body>
      </html >
  );
}
