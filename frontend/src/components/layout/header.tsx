import { useGetIdentity } from '@refinedev/core';
import { Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useLogout } from '@refinedev/core';
import type { MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

export const Header = () => {
  const { data: user } = useGetIdentity();
  const { mutate: logout } = useLogout();
  const { t } = useTranslation();

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <Space>
          <UserOutlined />
          <span>{t('common.profile')}</span>
        </Space>
      ),
    },
    {
      key: 'settings',
      label: (
        <Space>
          <SettingOutlined />
          <span>{t('common.settings')}</span>
        </Space>
      ),
    },
    {
      type: 'divider',
    },
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
            {user?.name || user?.username}
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



