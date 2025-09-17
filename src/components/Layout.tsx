import { useState } from "react";
import { Navigation } from "./Navigation";
import { Dashboard } from "./Dashboard";
import { CaregiverPortal } from "./CaregiverPortal";
import { MedicationTracker } from "./MedicationTracker";
import { AppointmentBooking } from "./AppointmentBooking";

export function Layout() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'caregiver':
        return <CaregiverPortal />;
      case 'medication':
        return <MedicationTracker />;
      case 'appointments':
        return <AppointmentBooking />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 lg:ml-64">
        {renderPage()}
      </main>
    </div>
  );
}