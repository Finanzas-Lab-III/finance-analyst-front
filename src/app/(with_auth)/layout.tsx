"use client";
import useAuthorized from "@/hooks/useAuthorized";
import {Loader} from "lucide-react";

const WithAuthLayout = ({
                          children,
                        }: Readonly<{
  children: React.ReactNode;
}>) => {
  const { isLoading, isAuthorized } = useAuthorized();

  if (isLoading || !isAuthorized) {
    return (
      <main className="h-screen calendar-gradient grid place-content-center">
        <Loader color="#00DEDA" />
      </main>
    );
  }

  return (
    <>
      {children}
    </>
  );
};

export default WithAuthLayout;
