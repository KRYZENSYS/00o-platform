// Locale layout - not used (parent layout handles)
import { redirect } from 'next/navigation';
export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return redirect('/');
}
