/**
 * 用户详情页面
 * 
 * 充分利用 Refine 的能力：
 * - 使用 Show 组件自动处理布局、编辑按钮、删除按钮等
 * - 使用 useShow hook 自动获取详情数据
 * - 使用 Typography 组件展示数据
 */

import { Show, EditButton, DeleteButton, RefreshButton } from '@refinedev/antd';
import { Typography } from 'antd';
import { useOne } from '@refinedev/core';
import { useParams } from 'react-router-dom';
import type { IResourceComponentsProps } from '@refinedev/core';

const { Title, Text } = Typography;

export const UserShow: React.FC<IResourceComponentsProps> = () => {
  const { id } = useParams<{ id: string }>();
  // useOne hook 自动获取详情数据
  const { query, result } = useOne({
    resource: 'users',
    id: id || '',
  });

  const record = result;
  const isLoading = query.isLoading;

  return (
    <Show
      isLoading={isLoading}
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <EditButton />
          <DeleteButton />
          <RefreshButton />
        </>
      )}
    >
      <Title level={5}>ID</Title>
      <Text>{record?.id}</Text>

      <Title level={5}>用户名</Title>
      <Text>{record?.username}</Text>

      <Title level={5}>邮箱</Title>
      <Text>{record?.email}</Text>

      <Title level={5}>昵称</Title>
      <Text>{record?.nickname || '-'}</Text>

      <Title level={5}>创建时间</Title>
      <Text>{record?.createdAt ? new Date(record.createdAt).toLocaleString() : '-'}</Text>

      <Title level={5}>更新时间</Title>
      <Text>{record?.updatedAt ? new Date(record.updatedAt).toLocaleString() : '-'}</Text>
    </Show>
  );
};

