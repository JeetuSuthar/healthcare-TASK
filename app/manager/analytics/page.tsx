"use client";
import { useEffect, useState } from "react";
import { Card, Typography, Spin, Row, Col } from "antd";
import { ManagerLayout } from "@/components/layouts/manager-layout";

const { Title } = Typography;

export default function ManagerAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
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
            }
          }`,
        }),
      });
      const { data } = await res.json();
      const shifts = data.shifts || [];
      // Calculate analytics
      const totalShifts = shifts.length;
      const avgDuration = shifts.length > 0
        ? (shifts.reduce((sum: number, shift: any) => {
            if (shift.clockInTime && shift.clockOutTime) {
              const inTime = new Date(shift.clockInTime).getTime();
              const outTime = new Date(shift.clockOutTime).getTime();
              return sum + (outTime - inTime) / (1000 * 60 * 60);
            }
            return sum;
          }, 0) / shifts.length).toFixed(2)
        : 0;
      setAnalytics({ totalShifts, avgDuration });
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  return (
    <ManagerLayout>
      <div className="p-6">
        <Title level={2}>Analytics</Title>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Total Shifts" bordered={false}>
                <span style={{ fontSize: 24 }}>{analytics.totalShifts}</span>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Avg Shift Duration (hrs)" bordered={false}>
                <span style={{ fontSize: 24 }}>{analytics.avgDuration}</span>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </ManagerLayout>
  );
}



