import { AuthPage } from '@refinedev/antd';

export const Login = () => {
  return (
    <AuthPage
      type="login"
      formProps={{
        initialValues: {
          username: '',
          password: '',
        },
      }}
      title={
        <div className="text-center mb-6">
          <h1>B端底座系统</h1>
          <p>欢迎登录</p>
        </div>
      }
    />
  );
};



