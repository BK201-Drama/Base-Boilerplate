/**
 * 用户编辑页面
 */

import { Edit, useForm } from '@refinedev/antd';
import type { IResourceComponentsProps } from '@refinedev/core';
import { UserForm } from './components/UserForm';

export const UserEdit: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <UserForm formProps={formProps} mode="edit" />
    </Edit>
  );
};



