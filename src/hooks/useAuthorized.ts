import { useState, useEffect } from "react";
import { authorize } from "@/lib/login-api";
import { useRouter } from "next/navigation";

const useAuthorized = () => {
  const router = useRouter();
  const [authState, setAuthState] = useState<{
    isLoading: boolean;
    isAuthorized: boolean;
  }>({
    isLoading: true,
    isAuthorized: false,
  });

  useEffect(() => {
    authorize()
      .then(() => {
        setAuthState({ isLoading: false, isAuthorized: true });
      })
      .catch(() => {
        setAuthState({ isLoading: false, isAuthorized: false });
        setTimeout(() => {
          router.replace("/login");
        }, 0);
      });
  }, [router]);

  return authState;
};

export default useAuthorized;