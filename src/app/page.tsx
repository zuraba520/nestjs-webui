'use client'; 

import React, { useEffect, useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import axios from 'axios';

import {
  Button,
  Input,
  Table,
  Typography,
  message,
  Popconfirm,
  Select,
} from 'antd';

const { Title } = Typography;



interface Course {
  _id: string;
  title: string;
  description: string;
  maxStudents: number;
  students: string[];
}


export default function Home() {

  const [courses, setCourses] = useState<Course[]>([]);// კურსის შენახვისათის
 

  const [loading, setLoading] = useState(true);
 

  const [statusFilter, setStatusFilter] = useState<string>('active');//აქტიური,წაშლილი

  useEffect(() => {
    fetchCourses();
  }, [statusFilter]);
  

  const fetchCourses = async (searchText?: string) => {
    //  კურსების წამოღების ფუნქცია

    setLoading(true);
    

    try {
      const endpoint = searchText
        ? `http://localhost:5050/courses/search/text?query=${searchText}&status=${statusFilter}`
        : `http://localhost:5050/courses?status=${statusFilter}`;
      // თუ არის ტექსტის  fulltext ძებნის API/ჩვეულებრივი GET

      const res = await axios.get(endpoint);
      //  GET მოთხოვნას

      setCourses(res.data);
      
    } catch (err) {
      console.error('შეცდომა კურსების წამოღებისას:', err);
      
    } finally {
      setLoading(false);
     
    }
  };

  const handleSearch = (value: string) => {

    const cleaned = value.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    //ტექსტის გასუფთავება

    fetchCourses(cleaned);
    //  ძებნა API-ში
  };

  const handleDelete = async (courseId: string) => {
    //  კურსის წაშლა

    try {
      await axios.delete(`http://localhost:5050/courses/${courseId}`);
      //  წაშლის მოთხოვნა მოთხოვნას

      message.success(' კურსი წარმატებით წაიშალა');
      

      fetchCourses();
      // ხელახლა გამოიძახე კურსების სია
    } catch (err: any) {
      message.error('❌ წაშლის შეცდომა');
      
    }
  };
//ცხრილი
  const columns = [
    

    {
      title: 'სათაური',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'აღწერა',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'მაქს სტუდენტები',
      dataIndex: 'maxStudents',
      key: 'maxStudents',
    },
    {
      title: 'დარეგისტრირებულები',
      key: 'students',
      render: (_: any, record: Course) => `${record.students.length}`,
      
    },
    {
      title: 'ქმედება',
      key: 'action',
      render: (_: any, record: Course) => (
        <>
          {/* Edit ღილაკი */}
          <Button type="link" onClick={() => (window.location.href = `/edit/${record._id}`)}>
            Edit
          </Button>

          {/* მომხმარებლის დამატება/წაშლა */}
          <Button type="link" onClick={() => (window.location.href = `/enroll/${record._id}`)}>
            მომ.დამატება/წაშლა
          </Button>

          {/*  წაშლა  */}
          <Popconfirm
            title="ნამდვილად გინდა კურსის წაშლა?"
            onConfirm={() => handleDelete(record._id)}
            okText="დიახ"
            cancelText="არა"
          >
            <Button type="link" danger>
              წაშლა
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/*  მთავარი კონტეინერი Tailwind class_ებით */}

      <Title level={3} style={{ color: 'black' }}>📚 კურსების სია</Title>

      {/*  კურსის დამატება + filter select */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            window.location.href = '/create';
          }}
        >
          ➕ კურსის დამატება
        </Button>

        <Select
          defaultValue="active"
          style={{ width: 180 }}
          onChange={(value) => setStatusFilter(value)}
          options={[
            { value: 'active', label: '🟢 აქტიური' },
            { value: 'deleted', label: '🗑 წაშლილი' },
          ]}
          allowClear={false}
        />
      </div>

      {/*  ძებნა */}
      <Input.Search
        placeholder="🔍 კურსის ძებნა"
        onSearch={handleSearch}
        allowClear
        enterButton
        style={{ maxWidth: 400, marginBottom: 20 }}
      />

      {/*  კურსების ცხრილი */}
      <Table
        columns={columns}
        dataSource={courses}
        rowKey="_id"
        loading={loading}
        pagination={false}
      
      />
     
    </div>
  );
}
