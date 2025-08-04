'use client';

import { usePathname } from 'next/navigation';
import Navbar from './navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();

  if (['/login', '/register', '/callback'].includes(pathname)) {
    return null;
  }

  return <Navbar />;
}
