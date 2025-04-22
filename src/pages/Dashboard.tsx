
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import ProfileHeader from "@/components/dashboard/ProfileHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import AcademicChart from "@/components/dashboard/AcademicChart";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <ProfileHeader />
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Overview</h2>
          <SummaryCards />
        </div>
        
        <div className="mt-8">
          <AcademicChart />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
