/**
 * 用户列表页面
 * 
 * 充分利用 Refine 的能力：
 * - 使用 List 组件自动处理布局、刷新按钮、创建按钮等
 * - 使用 useList hook 获取数据
 * - 使用 Table 组件自动处理分页、排序、筛选
 */

import { List, useTable, EditButton, ShowButton, DeleteButton, CreateButton } from '@refinedev/antd';
import { Table, Space } from 'antd';
import type { IResourceComponentsProps } from '@refinedev/core';

export const UserList: React.FC<IResourceComponentsProps> = () => {
  // useTable hook 自动处理分页、排序、筛选
  const { tableProps } = useTable({
    sorters: {
      initial: [
        {
          field: 'id',
          order: 'desc',
        },
      ],
    },
  });

  return (
    <List
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <CreateButton />
        </>
      )}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="id"
          title="ID"
          sorter
        />
        <Table.Column
          dataIndex="username"
          title="用户名"
          sorter
        />
        <Table.Column
          dataIndex="email"
          title="邮箱"
          sorter
        />
        <Table.Column
          dataIndex="nickname"
          title="昵称"
        />
        <Table.Column
          title="操作"
          dataIndex="actions"
          render={(_, record: any) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};


