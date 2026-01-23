/**
 * Mock 用户数据生成器
 * 
 * 用于生成测试用的用户数据
 */

import type { User } from '@/types';

// 示例用户名列表
const usernames = [
  'admin', 'alice', 'bob', 'charlie', 'david', 'eve', 'frank', 'grace',
  'henry', 'ivy', 'jack', 'kate', 'liam', 'mia', 'noah', 'olivia',
  'peter', 'quinn', 'ryan', 'sophia', 'thomas', 'una', 'victor', 'willa',
  'xavier', 'yara', 'zoe'
];

// 示例昵称列表
const nicknames = [
  '管理员', '爱丽丝', '鲍勃', '查理', '大卫', '伊芙', '弗兰克', '格蕾丝',
  '亨利', '艾薇', '杰克', '凯特', '利亚姆', '米娅', '诺亚', '奥利维亚',
  '彼得', '奎因', '瑞安', '索菲亚', '托马斯', '尤娜', '维克多', '威拉',
  '泽维尔', '雅拉', '佐伊'
];

// 示例邮箱域名
const emailDomains = ['example.com', 'test.com', 'demo.com', 'sample.org'];

// 角色列表
const roles = [
  { id: 1, name: 'admin', permissions: [{ resource: '*', action: '*' }] },
  { id: 2, name: 'user', permissions: [{ resource: 'dashboard', action: 'view' }] },
  { id: 3, name: 'editor', permissions: [{ resource: 'content', action: 'write' }] },
  { id: 4, name: 'viewer', permissions: [{ resource: '*', action: 'read' }] },
];

// 状态列表
const statuses: Array<'active' | 'inactive'> = ['active', 'inactive'];

/**
 * 生成单个 mock 用户
 */
const generateMockUser = (index: number): User => {
  const usernameIndex = index % usernames.length;
  const username = `${usernames[usernameIndex]}${index >= usernames.length ? index : ''}`;
  const nicknameIndex = index % nicknames.length;
  const nickname = `${nicknames[nicknameIndex]}${index >= nicknames.length ? index : ''}`;
  const emailDomain = emailDomains[index % emailDomains.length];
  const email = `${username}@${emailDomain}`;
  const status = statuses[index % statuses.length];
  const role = roles[index % roles.length];
  
  // 生成创建和更新时间（随机过去的时间）
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 365);
  const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const updatedAt = new Date(createdAt.getTime() + Math.random() * (now.getTime() - createdAt.getTime()));

  return {
    id: index + 1,
    username,
    nickname,
    email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    status,
    roles: [role],
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
};

/**
 * 生成指定数量的 mock 用户
 * 
 * @param count 要生成的用户数量
 * @returns User 数组
 */
export const getAllMockUsers = (count: number = 100): User[] => {
  return Array.from({ length: count }, (_, index) => generateMockUser(index));
};
