'use client';

import { Button } from "@repo/ui/components/button";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { useTransition } from "react";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export default function LogoutButton({ 
  variant = "outline", 
  size = "default",
  className,
  showIcon = true,
  children = "Logout"
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isPending}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {isPending ? "Logging out..." : children}
    </Button>
  );
}