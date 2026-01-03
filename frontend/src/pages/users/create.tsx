/**
 * 用户创建页面
 * 
 * 充分利用 Refine 的能力：
 * - 使用 Create 组件自动处理布局、保存按钮、取消按钮等
 * - 使用 useForm hook 处理表单状态和验证
 * - 使用 Form 组件自动处理表单提交
 */

import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select } from 'antd';
import type { IResourceComponentsProps } from '@refinedev/core';

export const UserCreate: React.FC<IResourceComponentsProps> = () => {
  // useForm hook 自动处理表单状态、验证、提交
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
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
          rules={[
            {
              required: true,
              message: '请输入密码',
            },
            {
              min: 6,
              message: '密码至少6位',
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="昵称"
          name="nickname"
        >
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
};


