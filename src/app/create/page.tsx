'use client'; 

import React from 'react';
import { Button, Form, Input, Typography } from 'antd';

import api from '@/lib/api/api'; //  axios გლობალური instance  
import { useRouter } from 'next/navigation'; //  Next.js router, window.location ის  მაგივრად
import '@ant-design/v5-patch-for-react-19';

const { Title } = Typography;

export default function CreateCoursePage() {
  

  const [form] = Form.useForm(); 
  const router = useRouter(); // wl

  const onFinish = async (values: any) => {

    try {
      //  კურსის მონ.დამატება
      await api.post('/courses', {
        ...values,
        status: 'active', // fallback ის გარეშე 
      });

      router.push('/'); // wl
    } catch (err) {
      console.error('შეცდომა კურსის შექმნისას:', err);
    }
  };

  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">

      <Title level={3} style={{ color: 'black' }}>
        ➕ ახალი კურსის დამატება
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish} 
        style={{ maxWidth: 600, marginTop: 32 }}
      >
        {/* სათაური */}
        <Form.Item
          label="სათაური"
          name="title"
          rules={[{ required: true, message: 'სათაური აუცილებელია' }]}
        >
          <Input placeholder="მაგ: React Bootcamp" />
        </Form.Item>

        {/* აღწერა */}
        <Form.Item label="აღწერა" name="description">
          <Input.TextArea rows={3} placeholder="კურსის მოკლე აღწერა" />
        </Form.Item>

        {/* მაქს სტუდენტები */}
        <Form.Item
          label="მაქსიმალური სტუდენტები"
          name="maxStudents"
          rules={[
            { required: true, message: 'მაქსიმალური სტუდენტების რაოდენობა აუცილებელია' },
            { type: 'number', min: 1, message: 'უნდა იყოს მინიმუმ 1' },
          ]}
          normalize={(value) => Number(value)} //
        >
          <Input type="number" placeholder="მაგ: 2,4,6,8,10" />
        </Form.Item>

        {/* submit და დაბრუნება */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            დამატება
          </Button>

          <Button
            style={{ marginLeft: 12 }}
            onClick={() => router.push('/')} // wl
          >
            მთავარ გვერდზე დაბრუნება
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
