/**
 * 登录页面
 * 
 * 使用提取的组件和 hooks 简化代码结构
 */

import { AuthPage } from '@refinedev/antd';
import { useWechatLogin } from './hooks/useWechatLogin';
import { WechatLoginButton } from './components/WechatLoginButton';
import { LoginTitle } from './components/LoginTitle';

export const Login = () => {
  const { isEnabled, loading, handleWechatLogin } = useWechatLogin();

  return (
    <AuthPage
      type="login"
      formProps={{
        initialValues: {
          username: '',
          password: '',
        },
      }}
      title={<LoginTitle />}
      renderContent={(content) => (
        <div>
          {content}
          {isEnabled && (
            <WechatLoginButton loading={loading} onClick={handleWechatLogin} />
          )}
        </div>
      )}
    />
  );
};
