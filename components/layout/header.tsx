import Link from "next/link";
import { UserMenu } from "./user-menu";
// import { Button } from "../ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <span className="font-bold text-xl">Stock Market Simulator</span>
        </Link>
        <div className="ml-auto flex items-center">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}