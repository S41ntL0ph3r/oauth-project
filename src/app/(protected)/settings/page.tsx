import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsClient from "./settings-client";

const SettingsPage = async () => {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return <SettingsClient session={session} />;
};

export default SettingsPage;
