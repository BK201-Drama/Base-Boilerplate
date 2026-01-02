/**
 * DashboardContainer - Dashboard 容器组件
 * 
 * 容器层：连接数据层和展示层
 * 负责：
 * 1. 从数据层（services）获取数据
 * 2. 处理业务逻辑
 * 3. 将数据传递给展示层组件
 * 4. 处理展示层组件的交互回调
 * 
 * 说明：
 * - 容器组件主要通过 Services 获取数据
 * - 业务数据通过 Services 获取，数据缓存由 Refine 的 React Query 自动处理
 * - UI 状态可以通过 React Context、localStorage 或组件状态管理
 */

import { StatisticsPresenter } from '@/components/dashboard';
import { useStatisticsService } from '@/services';

export const DashboardContainer = () => {
  // 从数据层获取服务
  // Services 内部使用 Refine hooks，数据缓存由 React Query 自动处理
  const statisticsService = useStatisticsService();

  // 提供默认值，避免展示层处理 null
  const statistics = statisticsService.statistics || {
    totalUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
    operationLogs: 0,
  };

  return (
    <StatisticsPresenter
      statistics={statistics}
      loading={statisticsService.loading}
    />
  );
};

