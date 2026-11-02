import { redirect } from 'next/navigation';

// There is no admin index page; the dashboard is the admin home (the layout shows the admin login to logged-out visitors).
export default function AdminIndexPage() {
  redirect('/admin/dashboard');
}
