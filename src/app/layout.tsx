import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserNav } from "@/components/UserNav";
import { List, Search } from "react-bootstrap-icons";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/shadcn/alert-dialog";
import { Button, buttonVariants } from "@/components/shadcn/button";
import { cn } from "@/utils/shadcn-utils";

const inter = Inter({ subsets: ["latin"] });

const navbarHeight = "64px";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const navItems = [
  { label: "Collections", href: "/all" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "App", href: "client" },
  { label: "Users", href: "/users" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fixed top-0 z-10 flex flex-col w-full shadow-xl bg-slate-800">
          <div className="border-b">
            <div className="flex items-center px-1 md:px-4 h-14">
              <div className="block md:hidden">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="px-2 py-1 text-sm transition rounded hover:bg-slate-600">
                      <List size={30} />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>osu!Collector</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-1">
                      {[{ href: "/", label: "Home" }, ...navItems].map(({ label, href }, i) => (
                        <Link href={href} key={i}>
                          <AlertDialogAction
                            className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
                          >
                            {label}
                          </AlertDialogAction>
                        </Link>
                      ))}
                    </div>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <Link href="/">
                <div className="flex items-center px-2 py-3 cursor-pointer">
                  osu!
                  <span className="font-semibold text-gray-50">Collector</span>
                </div>
              </Link>
              <nav className="items-center hidden mx-6 space-x-4 lg:space-x-6 md:flex">
                {navItems.map(({ label, href }, i) => (
                  <Link
                    href={href}
                    className="text-sm font-medium transition-colors hover:text-primary"
                    key={i}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center ml-auto space-x-4">
                <div className="hidden md:block">
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                      <Search />
                    </div>
                    <input
                      type="text"
                      className="text-sm rounded-lg block w-full ps-10 p-2.5  bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search..."
                      required
                    />
                  </div>
                </div>
                <UserNav />
              </div>
            </div>
          </div>
        </div>
        <div style={{ paddingTop: navbarHeight }}>{children}</div>
      </body>
    </html>
  );
}
