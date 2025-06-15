'use client';

import React from 'react';

import { Button, Form, Input, Typography } from 'antd';

import axios from 'axios';

import { useRouter } from 'next/navigation';

import '@ant-design/v5-patch-for-react-19';

const { Title } = Typography;

export default function CreateCoursePage() {
  //  მთავარი React კომპონენტი, რომელიც გამოაქვს ახალი კურსის დამატების გვერდს

  const [form] = Form.useForm();
  // AntD_ის ფორმის კონტროლერი 

  const router = useRouter();// url ის შეცვლა 

  const onFinish = async (values: any) => {//
    // თუ წარმატებით გავიდა მხოლოდ მაშინ გაეშვება

    try {
      await axios.post('http://localhost:5050/courses', values);
      //  აგზავნის POST მოთხოვნას API_ზე კურსის შესაქმნელად

      router.push('/');
    } catch (err) {
      console.error('შეცდომა კურსის შექმნისას:', err);
    }
  };

  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">

      <Title level={3} style={{ color: 'black' }}>➕ ახალი კურსის დამატება</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 600, marginTop: 32 }}
      >

        <Form.Item
          label="სათაური"
          name="title"
          rules={[{ required: true, message: 'სათაური აუცილებელია' }]}
        >
          <Input placeholder="მაგ: React Bootcamp" />
        </Form.Item>

        <Form.Item label="აღწერა" name="description">
          <Input.TextArea rows={3} placeholder="კურსის მოკლე აღწერა" />
        </Form.Item>

        <Form.Item
          label="მაქსიმალური სტუდენტები"
          name="maxStudents"
          rules={[
            { required: true, message: 'მაქსიმალური სტუდენტების რაოდენობა აუცილებელია' },
            { type: 'number', min: 1, message: 'უნდა იყოს მინიმუმ 1' },
          ]}
          normalize={(value) => Number(value)} 
        >
          <Input type="number" placeholder="მაგ: 2,4,6,8,10" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            დამატება
          </Button>
          

          <Button
            style={{ marginLeft: 12 }}
            onClick={() => router.push('/')}
          >
            მთავარ გვერდზე დაბრუნება
          </Button>
          
        </Form.Item>
      </Form>
    </div>
  );
}
