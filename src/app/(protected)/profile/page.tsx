import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileClient from "./profile-client";

const ProfilePage = async () => {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return <ProfileClient session={session} />;
};

export default ProfilePage;
