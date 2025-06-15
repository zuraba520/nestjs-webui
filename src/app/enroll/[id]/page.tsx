"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Form, Select, Typography, message } from "antd";
import axios from "axios";
import '@ant-design/v5-patch-for-react-19';

const { Title } = Typography;
const { Option } = Select;

interface User {
  _id: string;
  username: string;
}

export default function EnrollPage() {
  const { id } = useParams(); // კურსის ID URL-დან
  const router = useRouter();
  const [form] = Form.useForm();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailableUsers = async () => {
    try {
      const courseRes = await axios.get(`http://localhost:5050/courses/${id}`);
      const enrolledIds = courseRes.data.students.map((user: any) =>
        typeof user === "string" ? user : user._id
      );

      const usersRes = await axios.get("http://localhost:5050/users");

      const filtered = usersRes.data.filter(
        (user: User) => !enrolledIds.includes(user._id)
      );

      setUsers(filtered);
    } catch (err) {
      message.error("მონაცემების წამოღება ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAvailableUsers();
    }
  }, [id]);

  // რამდენიმე მომხმარებლის დამატება ერთდროულად
  const onFinish = async (values: { userIds: string[] }) => {
    try {
      for (const userId of values.userIds) {
        await axios.patch(`http://localhost:5050/users/${userId}/enroll/${id}`);
      }

      message.success("✅ მომხმარებლები წარმატებით დაემატნენ კურსზე");
      form.resetFields();
      router.push("/"); // დაბრუნება მთავარ გვერდზე
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "შეცდომა მოხდა";
      message.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Title level={3} style={{ color: "black" }}>
        📥 მომხმარებლის დამატება კურსზე
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 500 }}
      >
        <Form.Item
          label="აირჩიე მომხმარებლები"
          name="userIds"
          rules={[
            {
              required: true,
              message: "მომხმარებლების არჩევა აუცილებელია",
            },
          ]}
        >
          <Select
            mode="multiple"
            allowClear
            loading={loading}
            placeholder="მომხმარებლების არჩევა"
          >
            {users.map((user) => (
              <Option key={user._id} value={user._id}>
                {user.username}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            დამატება
          </Button>
          <Button
            type="default"
            style={{ marginLeft: 12 }}
            onClick={() => router.push("/")}
          >
            დაბრუნება
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
