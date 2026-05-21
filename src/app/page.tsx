import { redirect } from 'next/navigation'

// Root always redirects to login.
// The middleware will forward authenticated users to /home from there.
export default function RootPage() {
  redirect('/auth/login')
}
