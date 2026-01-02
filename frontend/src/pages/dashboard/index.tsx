import { Card, Row, Col, Statistic, Typography } from 'antd';
import { UserOutlined, TeamOutlined, FileTextOutlined, SafetyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores';

const { Title } = Typography;

export const Dashboard = () => {
  const { t } = useTranslation();
  
  // 从 store 中获取统计数据
  // 使用选择性订阅，只订阅需要的状态，避免不必要的重渲染
  const stats = useAppStore((state) => state.stats);

  const statistics = [
    {
      title: t('dashboard.totalUsers'),
      value: stats.totalUsers ?? 0,
      icon: <UserOutlined />,
      color: '#3f8600',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: t('dashboard.totalRoles'),
      value: stats.totalRoles ?? 0,
      icon: <TeamOutlined />,
      color: '#1890ff',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: t('dashboard.totalPermissions'),
      value: stats.totalPermissions ?? 0,
      icon: <SafetyOutlined />,
      color: '#cf1322',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      title: t('dashboard.operationLogs'),
      value: stats.operationLogs ?? 0,
      icon: <FileTextOutlined />,
      color: '#722ed1',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ];

  return (
    <div className="p-6 bg-gray-100 h-full overflow-auto">
      <Title level={2} className="mb-6 text-gray-800">
        {t('dashboard.title')}
      </Title>
      <Row gutter={[16, 16]}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              hoverable
              className="rounded-xl shadow-md transition-all duration-300 border-none overflow-hidden"
              bodyStyle={{
                padding: '24px',
                background: stat.gradient,
                position: 'relative',
              }}
            >
              <div className="relative z-10">
                <div className="text-[32px] text-white/90 mb-3">
                  {stat.icon}
                </div>
                <Statistic
                  title={
                    <span className="text-white/90 text-sm">
                      {stat.title}
                    </span>
                  }
                  value={stat.value}
                  valueStyle={{
                    color: '#fff',
                    fontSize: '28px',
                    fontWeight: 'bold',
                  }}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};



