'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Typography,
  message,
  Card,
  List,
  Popconfirm,
  Divider,
} from 'antd';
import { useParams, useRouter } from 'next/navigation';
import MultiUserSelect from '@/components/MultiUserSelect'; //  ჩვენი კომპონენტის იმპორტი
import '@ant-design/v5-patch-for-react-19';
import api from '@/lib/api/api'; //  axios-ის გლობალური instance

const { Title } = Typography;

interface User {
  _id: string;
  username: string;
}

export default function EditCoursePage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [enrolledUsers, setEnrolledUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [maxStudents, setMaxStudents] = useState(0);

  // კურსის მონაცემების წამოღება
  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}`); //გლობალურად
      form.setFieldsValue(res.data);
      setEnrolledUsers(res.data.students);
      setMaxStudents(res.data.maxStudents);
    } catch (err) {
      message.error('შეცდომა კურსის წამოღებისას');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCourse();
  }, [id]);

  // კურსის განახლება
  const onFinish = async (values: any) => {
    try {
      await api.patch(`/courses/${id}`, values);
      message.success('კურსი განახლდა');
      router.push('/');
    } catch (err) {
      message.error('კურსის განახლება ვერ მოხერხდა');
    }
  };

  // იუზერის წაშლა კურსიდან
  const handleUnenroll = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}/unenroll/${id}`);
      message.success('🗑️ წაიშალა');
      fetchCourse();
    } catch (err) {
      message.error('შეცდომა წაშლისას');
    }
  };

  // რამდენიმე იუზერის ერთად დამატება
  const handleBatchEnroll = async () => {
    if (selectedUserIds.length === 0) {
      message.warning('აირჩიე მაინც ერთი');
      return;
    }

    if (enrolledUsers.length + selectedUserIds.length > maxStudents) {
      message.error(`დაშვებულია მაქსიმუმ ${maxStudents} სტუდენტი`);
      return;
    }

    try {
      await Promise.all(
        selectedUserIds.map((userId) =>
          api.patch(`/users/${userId}/enroll/${id}`)
        )
      );
      message.success('დაემატნენ წარმატებით');
      setSelectedUserIds([]);
      fetchCourse();
    } catch (err) {
      message.error('დამატების შეცდომა');
    }
  };

  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Title level={3}>✏️ კურსის რედაქტირება</Title>

      <div style={{ display: 'flex', gap: 40 }}>
        {/* მარცხენა  ფორმა */}
        <div style={{ flex: 1 }}>
          <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 600 }}>
            <Form.Item
              label="სათაური"
              name="title"
              rules={[{ required: true, message: 'სათაური აუცილებელია' }]}
            >
              <Input placeholder="მაგ: Flutter" />
            </Form.Item>

            <Form.Item label="აღწერა" name="description">
              <Input.TextArea rows={3} placeholder="კურსის აღწერა" />
            </Form.Item>

            <Form.Item
              label="მაქსიმალური სტუდენტები"
              name="maxStudents"
              rules={[
                { required: true, message: 'აუცილებელია' },
                { type: 'number', min: 1, message: 'უნდა იყოს მინიმუმ 1' },
              ]}
              normalize={(value) => Number(value)}
            >
              <Input type="number" placeholder="მაგ: 10" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                განახლება
              </Button>
              <Button style={{ marginLeft: 12 }} onClick={() => router.push('/')}>
                დაბრუნება
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* მარჯვენა  იუზერები */}
        <div style={{ flex: 1 }}>
          <Card title="📋 დამატებული იუზერები">
            <MultiUserSelect
              value={selectedUserIds}
              onChange={setSelectedUserIds}
              excludeIds={enrolledUsers.map((user) => user._id)}
            />

            <Button
              type="primary"
              onClick={handleBatchEnroll}
              disabled={selectedUserIds.length === 0}
              style={{ marginBottom: 16, marginTop: 12 }}
            >
              დამატება
            </Button>

            <Divider />

            <List
              dataSource={enrolledUsers}
              renderItem={(user) => (
                <List.Item
                  actions={[
                    <Popconfirm
                      title="წავშალოთ?"
                      onConfirm={() => handleUnenroll(user._id)}
                      okText="დიახ"
                      cancelText="არა"
                    >
                      <Button danger size="small">წაშლა</Button>
                    </Popconfirm>
                  ]}
                >
                  {user.username}
                </List.Item>
              )}
              locale={{ emptyText: 'კურსზე ჯერ არავინ არის დამატებული' }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
