import { useGetIdentity } from '@refinedev/core';
import { Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useLogout } from '@refinedev/core';
import type { MenuProps } from 'antd';

const { Text } = Typography;

export const Header = () => {
  const { data: user } = useGetIdentity();
  const { mutate: logout } = useLogout();

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <Space>
          <UserOutlined />
          <span>个人资料</span>
        </Space>
      ),
    },
    {
      key: 'settings',
      label: (
        <Space>
          <SettingOutlined />
          <span>系统设置</span>
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
          <span>退出登录</span>
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



