import { redirect } from "next/navigation";
import { ROUTES } from "@/routes/route";

export default function Home() {
  // No "last opened project" concept yet, so land on the project
  // picker rather than guessing a project id.
  redirect(ROUTES.PROJECTS);
}
