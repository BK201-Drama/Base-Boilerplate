/**
 * 用户创建页面
 */

import { Create, useForm } from '@refinedev/antd';
import type { IResourceComponentsProps } from '@refinedev/core';
import { UserForm } from './components/UserForm';

export const UserCreate: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <UserForm formProps={formProps} mode="create" />
    </Create>
  );
};
