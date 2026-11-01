import { redirect } from 'next/navigation';

// There is no admin index page; the dashboard is the admin home (the layout sends logged-out visitors to /login).
export default function AdminIndexPage() {
  redirect('/admin/dashboard');
}
