import { Button } from "@/components/ui/button";
import { Github } from "@/components/ui/github";
import { signIn } from "@/lib/auth";

const GithubSignIn = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github", { redirectTo: "/" })
      }}
    >
      <Button className="w-full" variant="outline" type="submit">
        <Github />
        Continue with GitHub
      </Button>
    </form>
  );
};

export { GithubSignIn };
