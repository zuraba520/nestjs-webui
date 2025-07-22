"use client"; 
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; 
import { Button, Form, Select, Typography, message } from "antd";
import '@ant-design/v5-patch-for-react-19';

import api from '@/lib/api/api'; // axios გლობალური instance  

const { Title } = Typography;
const { Option } = Select;

//  ტიპი თითოეული User ისთვის
interface User {
  _id: string;
  username: string;
}

export default function EnrollPage() {
  const { id } = useParams(); 
  const router = useRouter(); // wl
  const [form] = Form.useForm();

  const [users, setUsers] = useState<User[]>([]); 
  const [loading, setLoading] = useState(true);   // ჩატვირთვის ინდიკატორი

  // გაფილტვრა
  const fetchAvailableUsers = async () => {
    try {
      // აიდით
      const courseRes = await api.get(`/courses/${id}`);

      //  უკვე enrolled  ID ები
      const enrolledIds = courseRes.data.students.map((user: any) =>
        typeof user === "string" ? user : user._id
      );

      // ყველა 
      const usersRes = await api.get("/users"); 

      // ვინც არარის enrolled
      const filtered = usersRes.data.filter(
        (user: User) => !enrolledIds.includes(user._id)
      );

      setUsers(filtered); // განახლება
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

  // ერთდროულად რამდენიმე იუზერის enrollment
  const onFinish = async (values: { userIds: string[] }) => {
    try {
      // თითოეული userId-სთვის გაგზავნე enrollment PATCH API
      for (const userId of values.userIds) {
        await api.patch(`/users/${userId}/enroll/${id}`);
      }

      message.success("✅ მომხმარებლები წარმატებით დაემატნენ კურსზე");
      form.resetFields();

      router.push("/");
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
            mode="multiple" //  მრავალმომხმარებლიანი სელექტი
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
