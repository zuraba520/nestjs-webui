'use client';

import React, { useEffect, useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import {
  Button,
  Input,
  Table,
  Typography,
  message,
  Popconfirm,
  Select,
  Pagination,
} from 'antd';
import api from '@/lib/api/api'; // axios-ის გლობალური instance

const { Title } = Typography;

//  Course ინტერფეისი
interface Course {
  _id: string;
  title: string;
  description: string;
  maxStudents: number;
  students: string[];
  status: 'active' | 'deleted'; // ახალი ველი 
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('active');

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // წამოიღოს კურსები თავიდან
  useEffect(() => {
    fetchCourses(undefined, 1, pagination.pageSize);
  }, [statusFilter]);

  //  კურსების წამოღება
  const fetchCourses = async (
    searchText?: string,
    page = pagination.current,
    limit = pagination.pageSize
  ) => {
    setLoading(true);
    try {
      let endpoint = '';
      if (searchText) {
        const cleaned = searchText.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
        endpoint = `/courses/search/text?query=${cleaned}&status=${statusFilter}`;
      } else {
        endpoint = `/courses?status=${statusFilter}&page=${page}&limit=${limit}`;
      }

      const res = await api.get(endpoint);
      const responseData = searchText
        ? { data: res.data, total: res.data.length }
        : res.data;

      setCourses(responseData.data || responseData);
      setPagination({
        current: page,
        pageSize: limit,
        total: responseData.total || responseData.length,
      });
    } catch (err) {
      console.error('შეცდომა კურსების წამოღებისას:', err);
    } finally {
      setLoading(false);
    }
  };

  //  ძებნა
  const handleSearch = (value: string) => {
    const cleaned = value.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    fetchCourses(cleaned);
  };

  //  წაშლა
  const handleDelete = async (courseId: string) => {
    try {
      await api.delete(`/courses/${courseId}`); // აქაც შესაცვლელია
      message.success('✅ კურსი წარმატებით წაიშალა');
      fetchCourses(undefined, pagination.current, pagination.pageSize);
    } catch (err) {
      message.error('❌ წაშლის შეცდომა');
    }
  };

  // აღდგენა
  const handleRestore = async (courseId: string) => {
    try {
      await api.patch(`/courses/${courseId}/restore`);
      message.success('✅ კურსი წარმატებით აღდგა!');
      fetchCourses(undefined, pagination.current, pagination.pageSize);
    } catch (err) {
      message.error('❌ აღდგენის შეცდომა');
    }
  };

  // ცხრილის სვეტები
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
      title: 'სტატუსი',
      key: 'status',
      render: (_: any, record: Course) => (
        <span style={{ color: record.status === 'deleted' ? 'red' : 'green' }}>
          {record.status === 'deleted' ? 'წაშლილი' : 'აქტიური'}
        </span>
      ),
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
          {/* ✏️ Edit */}
          <Button type="link" onClick={() => (window.location.href = `/edit/${record._id}`)}>
            Edit
          </Button>

          {/*  მომხმარებლების მართვა */}
          <Button type="link" onClick={() => (window.location.href = `/enroll/${record._id}`)}>
            მომ.დამატება/წაშლა
          </Button>

          {/*  წაშლა */}
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

          {/*  აღდგენა (მხოლოდ წაშლილისთვის) */}
          {record.status === 'deleted' && (
            <Popconfirm
              title="ნამდვილად გსურთ წაშლილი კურსის აღდგენა?"
              onConfirm={() => handleRestore(record._id)}
              okText="დიახ"
              cancelText="არა"
            >
              <Button type="link" style={{ color: 'green' }}>
                აღდგენა
              </Button>
            </Popconfirm>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <Title level={3} style={{ color: 'black' }}>📚 კურსების სია</Title>

      {/* Actions: დამატება და ფილტრი */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <Button type="primary" onClick={() => window.location.href = '/create'}>
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
        />
      </div>

      {/* ძებნა */}
      <Input.Search
        placeholder="🔍 კურსის ძებნა"
        onSearch={handleSearch}
        allowClear
        enterButton
        style={{ maxWidth: 400, marginBottom: 20 }}
      />

      {/* ცხრილი */}
      <Table
        columns={columns}
        dataSource={courses}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

      {/* pagination */}
      <div className="flex justify-center mt-6">
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showSizeChanger
          pageSizeOptions={['5', '10', '15', '20', '25', '30']}
          onChange={(page, pageSize) => {
            fetchCourses(undefined, page, pageSize);
          }}
          locale={{ items_per_page: ' users' }}
        />
      </div>
    </div>
  );
}
