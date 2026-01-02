/**
 * 用户编辑页面
 * 
 * 充分利用 Refine 的能力：
 * - 使用 Edit 组件自动处理布局、保存按钮、取消按钮等
 * - 使用 useForm hook 自动加载数据并处理表单状态
 * - 使用 useShow 或 useOne 获取详情数据（useForm 内部已处理）
 */

import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select } from 'antd';
import type { IResourceComponentsProps } from '@refinedev/core';

export const UserEdit: React.FC<IResourceComponentsProps> = () => {
  // useForm hook 自动加载数据、处理表单状态、验证、提交
  const { formProps, saveButtonProps, queryResult } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="用户名"
          name="username"
          rules={[
            {
              required: true,
              message: '请输入用户名',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            {
              required: true,
              type: 'email',
              message: '请输入有效的邮箱地址',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          help="留空则不修改密码"
        >
          <Input.Password placeholder="留空则不修改" />
        </Form.Item>
        <Form.Item
          label="昵称"
          name="nickname"
        >
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
};

