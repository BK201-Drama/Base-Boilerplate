import { useGetIdentity } from '@refinedev/core';
import { Layout, Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useLogout } from '@refinedev/core';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;
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
    },
  ];

  return (
    <AntHeader
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0 24px',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Space>
        <Text strong>{user?.name || user?.username}</Text>
        <Dropdown menu={{ items }} placement="bottomRight">
          <Avatar
            style={{ cursor: 'pointer' }}
            src={user?.avatar}
            icon={!user?.avatar && <UserOutlined />}
          />
        </Dropdown>
      </Space>
    </AntHeader>
  );
};



