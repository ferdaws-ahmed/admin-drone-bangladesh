import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Drone BD Admin',
  description: 'Admin panel for Drone BD',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Global Toast Container */}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}