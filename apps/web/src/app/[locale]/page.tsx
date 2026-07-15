// Locale root - just redirect to marketing root
import { redirect } from 'next/navigation';
export default function LocaleRoot() { redirect('/'); }
