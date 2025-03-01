"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogIn, LogOut, User } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="outline" size="sm" className="gap-2">
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm" className="gap-2">
            <User className="h-4 w-4" />
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <p className="font-medium">{session.user?.name}</p>
        <p className="text-xs text-muted-foreground">{session.user?.email}</p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2"
        onClick={() => signOut()}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}