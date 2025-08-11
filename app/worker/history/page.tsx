"use client";

import { Typography } from "antd";
import { WorkerLayout } from "@/components/layouts/worker-layout";
import { ShiftHistory } from "@/components/shift-history";

const { Title } = Typography;

export default function WorkerHistoryPage() {
  return (
    <WorkerLayout>
      <div className="p-3 sm:p-5 md:p-6 max-w-7xl mx-auto w-full">
        <div className="mb-4 sm:mb-6">
          <Title level={2} className="!mb-1 text-2xl sm:text-3xl !text-gray-800">Shift History</Title>
          <p className="text-gray-500 text-sm">All your past shifts (latest 50) with IST timestamps.</p>
        </div>
        <ShiftHistory />
      </div>
    </WorkerLayout>
  );
}

