"use client";
import { useEffect, useState } from "react";
import { Table, Typography, Spin } from "antd";
import { ManagerLayout } from "@/components/layouts/manager-layout";

const { Title } = Typography;

export default function ManagerStaffPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{
            users {
              id
              email
              firstName
              lastName
              role
            }
          }`,
        }),
      });
      const { data } = await res.json();
      setUsers(data.users || []);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const columns = [
    { title: "First Name", dataIndex: "firstName", key: "firstName" },
    { title: "Last Name", dataIndex: "lastName", key: "lastName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
  ];

  return (
    <ManagerLayout>
      <div className="p-6">
        <Title level={2}>Staff Management</Title>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Table
            dataSource={users}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>
    </ManagerLayout>
  );
}

