"use client";

import { Typography } from "antd";
import { WorkerLayout } from "@/components/layouts/worker-layout";
import { ShiftHistory } from "@/components/shift-history";

const { Title } = Typography;

export default function WorkerHistoryPage() {
  return (
    <WorkerLayout>
      <div className="p-2 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
        {/* Constrained container */}
        <div className="w-full max-w-full">
          {/* Header section */}
          <div className="mb-3 sm:mb-6">
            <Title level={2} className="!mb-1 text-lg sm:text-2xl md:text-3xl !text-gray-800">
              Shift History
            </Title>
            <p className="text-gray-500 text-xs sm:text-sm">
              Your recent shifts with IST timestamps
            </p>
          </div>

          {/* Table container with proper constraints */}
          <div className="w-full max-w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="w-full max-w-full p-3 sm:p-4">
              <ShiftHistory />
            </div>
          </div>
        </div>
      </div>
    </WorkerLayout>
  );
}