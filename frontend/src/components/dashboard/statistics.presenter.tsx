/**
 * StatisticsPresenter - 统计数据展示组件
 * 
 * 展示层：纯展示组件，不包含任何业务逻辑
 * 所有数据通过 props 传入
 * 这个组件可以在任何平台复用（Web、H5、移动端等）
 */

import { Card, Row, Col, Statistic, Typography } from 'antd';
import { UserOutlined, TeamOutlined, FileTextOutlined, SafetyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Statistics } from '@/types';

const { Title } = Typography;

export interface StatisticsPresenterProps {
  statistics: Statistics;
  loading?: boolean;
}

export const StatisticsPresenter = ({ statistics, loading = false }: StatisticsPresenterProps) => {
  const { t } = useTranslation();

  const statisticsList = [
    {
      title: t('dashboard.totalUsers'),
      value: statistics.totalUsers ?? 0,
      icon: <UserOutlined />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: t('dashboard.totalRoles'),
      value: statistics.totalRoles ?? 0,
      icon: <TeamOutlined />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: t('dashboard.totalPermissions'),
      value: statistics.totalPermissions ?? 0,
      icon: <SafetyOutlined />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      title: t('dashboard.operationLogs'),
      value: statistics.operationLogs ?? 0,
      icon: <FileTextOutlined />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ];

  return (
    <div className="p-6 bg-gray-100 h-full overflow-auto">
      <Title level={2} className="mb-6 text-gray-800">
        {t('dashboard.title')}
      </Title>
      <Row gutter={[16, 16]}>
        {statisticsList.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              hoverable
              loading={loading}
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

