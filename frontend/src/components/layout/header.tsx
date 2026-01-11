/**
 * Header 组件
 * 
 * 直接使用 Refine hooks 获取用户信息
 */

import { Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { useGetIdentity, useLogout } from '@refinedev/core';
import type { User } from '@/types';

const { Text } = Typography;

/**
 * Header 组件
 * 
 * 显示当前用户信息和登出按钮
 */
export const Header = () => {
  const { t } = useTranslation();
  const { data: user } = useGetIdentity<User>();
  const { mutate: logout } = useLogout();

  const items: MenuProps['items'] = [
    {
      key: 'logout',
      label: (
        <Space>
          <LogoutOutlined />
          <span>{t('common.logout')}</span>
        </Space>
      ),
      onClick: () => logout(),
      danger: true,
    },
  ];

  return (
    <div className="flex justify-end items-center px-5 h-16 min-h-16 bg-gradient-to-br from-primary-start to-primary-end shadow-md">
      <Space size="small">
        <div className="text-right">
          <Text strong className="text-white block text-[13px] leading-[1.2]">
            {user?.name || user?.nickname || user?.username || ''}
          </Text>
        </div>
        <Dropdown menu={{ items }} placement="bottomRight" arrow>
          <Avatar
            className="cursor-pointer border-2 border-white/30 shadow-md"
            size="default"
            src={user?.avatar}
            icon={!user?.avatar && <UserOutlined />}
          />
        </Dropdown>
      </Space>
    </div>
  );
};
