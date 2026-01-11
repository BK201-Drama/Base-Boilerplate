/**
 * 用户表单组件（Create/Edit 共用）
 *
 * 就近原则：页面专用组件放在页面目录下
 */

import { Form, Input } from 'antd';
import type { FormInstance } from 'antd';

interface UserFormProps {
  /** 表单实例（来自 useForm 的 formProps） */
  formProps: {
    form?: FormInstance;
    onFinish?: (values: any) => void;
    initialValues?: any;
  };
  /** 模式：create 创建 / edit 编辑 */
  mode: 'create' | 'edit';
}

/**
 * 用户表单字段
 *
 * 根据 mode 自动调整：
 * - create: 密码必填
 * - edit: 密码可选（留空不修改）
 */
export const UserForm: React.FC<UserFormProps> = ({ formProps, mode }) => {
  const isCreate = mode === 'create';

  return (
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
        rules={
          isCreate
            ? [
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' },
              ]
            : [{ min: 6, message: '密码至少6位' }]
        }
        help={isCreate ? undefined : '留空则不修改密码'}
      >
        <Input.Password placeholder={isCreate ? undefined : '留空则不修改'} />
      </Form.Item>

      <Form.Item label="昵称" name="nickname">
        <Input />
      </Form.Item>
    </Form>
  );
};
