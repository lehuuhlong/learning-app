import type { Metadata } from "next";
import DokkaiReader from "@/components/dokkai/DokkaiReader";

export const metadata: Metadata = {
  title: "Dokkai (Reading) — JLPT Master",
  description:
    "Practice JLPT reading comprehension with interactive passages and questions",
};

export default function DashboardDokkaiPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <DokkaiReader />
    </div>
  );
}
