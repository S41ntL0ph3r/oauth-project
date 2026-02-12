import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserProvider } from "@/contexts/user-context";
import ProtectedLayoutClient from "@/components/protected-layout-client";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <UserProvider>
      <ProtectedLayoutClient>{children}</ProtectedLayoutClient>
    </UserProvider>
  );
}
