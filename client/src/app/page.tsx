import { redirect } from "next/navigation";
import { ROUTES } from "@/routes/route";

export default function Home() {
  
 redirect(ROUTES.DASHBOARD)
}
