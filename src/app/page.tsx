import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Page() {
  const userId = cookies().get('userId')?.value;
  if (!userId) {
    redirect('/login');
  }
  redirect('/backoffice/archive');
}
