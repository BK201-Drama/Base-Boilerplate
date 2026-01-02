/**
 * HeaderPresenter - Header 展示组件
 * 
 * 展示层：纯展示组件，不包含任何业务逻辑
 * 所有数据通过 props 传入，所有交互通过回调函数处理
 * 这个组件可以在任何平台复用（Web、H5、移动端等）
 */

import { Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';
import type { User } from '@/types';

const { Text } = Typography;

export interface HeaderPresenterProps {
  user: User | null;
  onLogout: () => void;
}

export const HeaderPresenter = ({ user, onLogout }: HeaderPresenterProps) => {
  const { t } = useTranslation();

  const items: MenuProps['items'] = [
    {
      key: 'logout',
      label: (
        <Space>
          <LogoutOutlined />
          <span>{t('common.logout')}</span>
        </Space>
      ),
      onClick: onLogout,
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

