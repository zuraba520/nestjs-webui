"use client";

import { Select, message } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";

const { Option } = Select;

interface User {
  _id: string;
  username: string;
}

interface Props {
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  excludeIds?: string[];
}

export default function MultiUserSelect({
  value,
  onChange,
  disabled = false,
  excludeIds = [],
}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {//იუსერების წამოღება
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5050/users");
        const filtered = res.data.filter(
          (user: User) => !excludeIds.includes(user._id)
        );
        setUsers(filtered);
      } catch (err) {
        message.error("მომხმარებლების წამოღება ვერ მოხერხდა");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [excludeIds]);

  return (
    <Select
      mode="multiple"
      allowClear //x
      placeholder="აირჩიე მომხმარებლები"
      value={value}
      onChange={onChange}
      disabled={disabled}
      loading={loading}
      style={{ width: "100%" }}
    >
      {users.map((user) => (
        <Option key={user._id} value={user._id}>
          {user.username}
        </Option>
      ))}
    </Select>
  );
}
