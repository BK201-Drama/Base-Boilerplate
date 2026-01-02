/**
 * HeaderContainer - Header 容器组件
 * 
 * 容器层：连接数据层和展示层
 * 负责：
 * 1. 从数据层（services）获取用户数据
 * 2. 处理业务逻辑（如登出）
 * 3. 将数据传递给展示层组件
 * 4. 处理展示层组件的交互回调
 */

import { HeaderPresenter } from '@/components/layout/header.presenter';
import { useRefineUserService } from '@/services';

export const HeaderContainer = () => {
  // 从数据层获取服务
  const userService = useRefineUserService();
  const user = userService.user;

  // 处理业务逻辑
  const handleLogout = async () => {
    await userService.logout();
  };

  // 将数据传递给展示层组件
  return (
    <HeaderPresenter
      user={user}
      onLogout={handleLogout}
    />
  );
};

