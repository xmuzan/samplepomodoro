// This is now the main entry point and will be handled by the protected layout.
// We redirect to /tasks to trigger the logic in the layout.
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/tasks');
  return null;
}
