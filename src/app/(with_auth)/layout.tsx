"use client";
import useAuthorized from "@/hooks/useAuthorized";
import {Loader} from "lucide-react";
import React, {useEffect, useState} from "react";
import {NavBarData} from "@/types/profile";
import {getProfile} from "@/lib/user-api";
import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import {Geist, Geist_Mono} from "next/font/google";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const WithAuthLayout = ({
                          children,
                        }: Readonly<{
  children: React.ReactNode;
}>) => {
  const [navBarData, setNavBarData] = useState<NavBarData | null>(null);
  const { isLoading, isAuthorized } = useAuthorized();

  useEffect(() => {
    const fetchProfile = async () => {
      try{
        const data = await getProfile()
        if (data) {
          setNavBarData(data);
        } else {
          console.error("Failed to fetch profile data");
        }
      }
      catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfile();
  }, []);


  if (isLoading || !isAuthorized) {
    return (
      <main className="h-screen calendar-gradient grid place-content-center">
        <Loader color="#00DEDA" />
      </main>
    );
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}>
      {navBarData &&
        <BackofficeHeader profile={navBarData} />
      }
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default WithAuthLayout;
