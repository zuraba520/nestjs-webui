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
import { useRouter } from 'next/navigation'; 
import api from '@/lib/api/api'; 

const { Title } = Typography;

interface Course {
  _id: string;
  title: string;
  description: string;
  maxStudents: number;
  students: string[];
  status: 'active' | 'deleted';
}

//  ტიპი fetchCourses სთვის
type FetchCoursesParams = {
  searchText?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export default function Home() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<string>('active'); 
  const [searchText, setSearchText] = useState<string>(''); //  ძებნის ტექსტი

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  //  statusFilter ის ცვლილებისას
  useEffect(() => {
    fetchCourses({
      searchText,
      status: statusFilter,
      page: 1,
      limit: pagination.pageSize,
    });
  }, [statusFilter]);

  //search, pagination და filter  ყვოლიფერი ერთიანად
  const fetchCourses = async ({
    searchText = '',
    status = 'active', // ფალლბექის გარეშე
    page = 1,
    limit = 10,
  }: FetchCoursesParams) => {
    setLoading(true);
    try {
      //   გაწმენდა, მრავალსიტყვიანი ძიებისთვის
      const cleaned = searchText.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();

      const res = await api.get('/courses/search', {
        params: {
          query: cleaned,
          status,       //  status ის  პირდაპირ გადაეცემა
          page,
          limit,
        },
      });

      setCourses(res.data.data || []);
      setPagination({
        current: page,
        pageSize: limit,
        total: res.data.total || 0,
      });
    } catch (err) {
      console.error('შეცდომა კურსების წამოღებისას:', err);
      message.error('კურსების ჩამოტვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  //  ძებნა სეარჩში
  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchCourses({
      searchText: value,
      status: statusFilter,
      page: 1,
      limit: pagination.pageSize,
    });
  };

  //  კურსის წაშლა
  const handleDelete = async (courseId: string) => {
    try {
      await api.delete(`/courses/${courseId}`); //  soft delete
      message.success('✅ კურსი წარმატებით წაიშალა');

      // განახლება
      fetchCourses({
        searchText,
        status: statusFilter,
        page: pagination.current,
        limit: pagination.pageSize,
      });
    } catch (err) {
      message.error('❌ წაშლის შეცდომა');
    }
  };

  // წაშლილის აღდგენა
  const handleRestore = async (courseId: string) => {
    try {
      await api.patch(`/courses/${courseId}/restore`);
      message.success('✅ კურსი წარმატებით აღდგა!');

      fetchCourses({
        searchText,
        status: statusFilter,
        page: pagination.current,
        limit: pagination.pageSize,
      });
    } catch (err) {
      message.error('❌ აღდგენის შეცდომა');
    }
  };

  //  ცხრილის ბოძები
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
          {/*  კურსის რედაქტირება */}
          <Button type="link" onClick={() => router.push(`/edit/${record._id}`)}>
            Edit
          </Button>

          {/* Enrollment გვერდზე გადასვლა */}
          <Button type="link" onClick={() => router.push(`/enroll/${record._id}`)}>
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

          {/*  აღდგენა მხოლოდ წაშლილისთვის */}
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
      <Title level={3} style={{ color: 'black' }}>📚 კურსების სია</Title>

      {/*  კურსის დამატება და სტატუსის ფილტრი */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <Button type="primary" onClick={() => router.push('/create')}>
          ➕ კურსის დამატება
        </Button>

        {/*  სტატუსის პირდაპირ გადაცემა */}
        <Select
          value={statusFilter}
          style={{ width: 180 }}
          onChange={(value) => setStatusFilter(value)}
          options={[
            { value: 'active', label: '🟢 აქტიური' },
            { value: 'deleted', label: '🗑 წაშლილი' },
          ]}
        />
      </div>

    
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

      {/* გვერდების კონტროლი */}
      <div className="flex justify-center mt-6">
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showSizeChanger
          pageSizeOptions={['5', '10', '15', '20', '25', '30']}
          onChange={(page, pageSize) => {
            fetchCourses({
              searchText,
              status: statusFilter,
              page,
              limit: pageSize,
            });
          }}
          locale={{ items_per_page: ' კურსი' }}
        />
      </div>
    </div>
  );
}
