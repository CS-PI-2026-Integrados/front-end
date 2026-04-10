import { Outlet } from "react-router-dom";
import Header from "../components/dashboard/Header";

export default function DashboardLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}