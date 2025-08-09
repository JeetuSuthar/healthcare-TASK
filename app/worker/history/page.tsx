"use client";
import { useEffect, useState } from "react";
import { Table, Typography, Spin } from "antd";
import { useAuth } from "@/hooks/use-auth";
import { WorkerLayout } from "@/components/layouts/worker-layout";

const { Title } = Typography;

export default function WorkerHistoryPage() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchShifts = async () => {
      setLoading(true);
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{
            shifts {
              id
              clockInTime
              clockOutTime
              clockInLatitude
              clockInLongitude
              clockOutLatitude
              clockOutLongitude
              clockInNote
              clockOutNote
            }
          }`,
        }),
      });
      const { data } = await res.json();
      setShifts(data.shifts || []);
      setLoading(false);
    };
    fetchShifts();
  }, [user]);

  const columns = [
    { title: "Clock In", dataIndex: "clockInTime", key: "clockInTime" },
    { title: "Clock Out", dataIndex: "clockOutTime", key: "clockOutTime" },
    { title: "Clock In Note", dataIndex: "clockInNote", key: "clockInNote" },
    { title: "Clock Out Note", dataIndex: "clockOutNote", key: "clockOutNote" },
  ];

  return (
    <WorkerLayout>
      <div className="p-6">
        <Title level={2}>Shift History</Title>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Table
            dataSource={shifts}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>
    </WorkerLayout>
  );
}

