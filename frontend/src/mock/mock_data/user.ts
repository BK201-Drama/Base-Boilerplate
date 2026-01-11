/**
 * 用户 Mock 数据
 */

import type { User } from '@/types/user.types';

// 模拟用户数据列表
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    nickname: '超级管理员',
    email: 'admin@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    status: 'active',
    roles: [
      {
        id: 1,
        name: 'admin',
        permissions: [
          { resource: 'users', action: 'list' },
          { resource: 'users', action: 'create' },
          { resource: 'users', action: 'edit' },
          { resource: 'users', action: 'delete' },
          { resource: 'dashboard', action: 'view' },
        ],
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    username: 'zhangsan',
    nickname: '张三',
    email: 'zhangsan@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    status: 'active',
    roles: [
      {
        id: 2,
        name: 'user',
        permissions: [
          { resource: 'dashboard', action: 'view' },
        ],
      },
    ],
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
  },
  {
    id: 3,
    username: 'lisi',
    nickname: '李四',
    email: 'lisi@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    status: 'active',
    roles: [
      {
        id: 2,
        name: 'user',
        permissions: [
          { resource: 'dashboard', action: 'view' },
        ],
      },
    ],
    createdAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
  },
  {
    id: 4,
    username: 'wangwu',
    nickname: '王五',
    email: 'wangwu@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
    status: 'inactive',
    roles: [
      {
        id: 3,
        name: 'editor',
        permissions: [
          { resource: 'users', action: 'list' },
          { resource: 'users', action: 'edit' },
          { resource: 'dashboard', action: 'view' },
        ],
      },
    ],
    createdAt: '2024-01-10T11:30:00Z',
    updatedAt: '2024-01-14T09:00:00Z',
  },
  {
    id: 5,
    username: 'zhaoliu',
    nickname: '赵六',
    email: 'zhaoliu@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu',
    status: 'active',
    roles: [
      {
        id: 2,
        name: 'user',
        permissions: [
          { resource: 'dashboard', action: 'view' },
        ],
      },
    ],
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-15T08:30:00Z',
  },
  {
    id: 6,
    username: 'sunqi',
    nickname: '孙七',
    email: 'sunqi@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi',
    status: 'active',
    roles: [
      {
        id: 3,
        name: 'editor',
        permissions: [
          { resource: 'users', action: 'list' },
          { resource: 'users', action: 'edit' },
          { resource: 'dashboard', action: 'view' },
        ],
      },
    ],
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    id: 7,
    username: 'zhouba',
    nickname: '周八',
    email: 'zhouba@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouba',
    status: 'inactive',
    roles: [
      {
        id: 2,
        name: 'user',
        permissions: [
          { resource: 'dashboard', action: 'view' },
        ],
      },
    ],
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
  },
  {
    id: 8,
    username: 'wujiu',
    nickname: '吴九',
    email: 'wujiu@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wujiu',
    status: 'active',
    roles: [
      {
        id: 2,
        name: 'user',
        permissions: [
          { resource: 'dashboard', action: 'view' },
        ],
      },
    ],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T11:30:00Z',
  },
  {
    id: 9,
    username: 'zhengshi',
    nickname: '郑十',
    email: 'zhengshi@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhengshi',
    status: 'active',
    roles: [
      {
        id: 3,
        name: 'editor',
        permissions: [
          { resource: 'users', action: 'list' },
          { resource: 'users', action: 'edit' },
          { resource: 'dashboard', action: 'view' },
        ],
      },
    ],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T13:00:00Z',
  },
  {
    id: 10,
    username: 'qianyi',
    nickname: '钱一',
    email: 'qianyi@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qianyi',
    status: 'active',
    roles: [
      {
        id: 2,
        name: 'user',
        permissions: [
          { resource: 'dashboard', action: 'view' },
        ],
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
  },
];

// 根据 ID 获取用户
export const getMockUserById = (id: string | number): User | undefined => {
  return mockUsers.find(user => user.id === Number(id));
};

// 根据用户名获取用户
export const getMockUserByUsername = (username: string): User | undefined => {
  return mockUsers.find(user => user.username === username);
};

// 生成更多模拟用户数据（用于分页测试）
export const generateMockUsers = (count: number, startId: number = 11): User[] => {
  const names = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴'];
  const users: User[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const firstName = names[Math.floor(Math.random() * names.length)];
    const username = `user${id}`;
    
    users.push({
      id,
      username,
      nickname: `${firstName}用户${id}`,
      email: `${username}@example.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      status: Math.random() > 0.2 ? 'active' : 'inactive',
      roles: [
        {
          id: 2,
          name: 'user',
          permissions: [
            { resource: 'dashboard', action: 'view' },
          ],
        },
      ],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  return users;
};

// 获取所有模拟用户（包含生成的）
export const getAllMockUsers = (total: number = 100): User[] => {
  if (total <= mockUsers.length) {
    return mockUsers.slice(0, total);
  }
  return [...mockUsers, ...generateMockUsers(total - mockUsers.length)];
};

