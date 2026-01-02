import { HeaderPresenter } from '@/components/layout/header.presenter';
import { useRefineUserService } from '@/services/user.service';

export const HeaderContainer = () => {
  const userService = useRefineUserService();
  const user = userService.user;

  const handleLogout = async () => {
    await userService.logout();
  };

  return (
    <HeaderPresenter
      user={user}
      onLogout={handleLogout}
    />
  );
};

