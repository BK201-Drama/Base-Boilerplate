import { Typography } from 'antd';

const { Title: AntTitle } = Typography;

export const Title = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <div
      className={`text-center transition-all duration-300 bg-gradient-to-br from-primary-start to-primary-end ${
        collapsed ? 'p-2 m-2 rounded-lg' : 'p-4 m-0 rounded-none'
      }`}
    >
      <AntTitle
        level={4}
        className={`m-0 text-white font-semibold transition-all duration-300 drop-shadow-sm ${
          collapsed ? 'text-sm' : 'text-lg'
        }`}
      >
        {collapsed ? 'B端' : 'B端底座系统'}
      </AntTitle>
    </div>
  );
};



