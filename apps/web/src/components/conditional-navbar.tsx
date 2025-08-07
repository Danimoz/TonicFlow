'use client';

import { usePathname } from 'next/navigation';
import Navbar from './navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const routesWithoutNavbar = [
    '/login',
    '/register',
    '/callback',
  ];

  if (routesWithoutNavbar.includes(pathname) || pathname.startsWith('/project/')) {
    return null;
  }

  return <Navbar />;
}
