import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

const DashboardPage = async () => {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return <DashboardClient />;
};

export default DashboardPage;
