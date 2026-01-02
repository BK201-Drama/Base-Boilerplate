import { Typography } from 'antd';

const { Title: AntTitle } = Typography;

export const Title = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <AntTitle
      level={4}
      style={{
        margin: 0,
        padding: '16px',
        textAlign: 'center',
        fontSize: collapsed ? '14px' : '18px',
        transition: 'all 0.2s',
      }}
    >
      {collapsed ? 'B端' : 'B端底座系统'}
    </AntTitle>
  );
};



