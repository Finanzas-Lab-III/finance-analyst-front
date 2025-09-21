import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  const userRole = cookieStore.get('userRole')?.value;
  
  if (!userId) {
    redirect('/login');
  }
  
  // Redirect based on userRole cookie
  if (userRole === 'director') {
    redirect('/backoffice/archive');
  } else if (userRole === 'finance') {
    redirect('/backoffice/archive');
  } else {
    // Fallback if userRole is not set
    redirect('/backoffice/archive');
  }
}
