/**
 * Dashboard 页面
 *
 * 使用就近放置的 useDashboardData hook
 */

import { StatisticsPresenter } from '@/components/dashboard';
import { useDashboardData } from './useDashboardData';

export const Dashboard = () => {
  const { statistics, isLoading } = useDashboardData();

  return <StatisticsPresenter statistics={statistics} loading={isLoading} />;
};
