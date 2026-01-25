/**
 * 登录页面
 * 
 * 使用提取的组件和 hooks 简化代码结构
 */

import { useLogin } from '@refinedev/core';
import { Button, Form, Input, message } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useWechatLogin } from './hooks/useWechatLogin';
import { WechatLoginButton } from './components/WechatLoginButton';
import { LoginTitle } from './components/LoginTitle';

export const Login = () => {
  const { t } = useTranslation();
  const { isEnabled, loading, handleWechatLogin } = useWechatLogin();
  const { mutate: login } = useLogin();
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        {/* 登录卡片 */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          {/* 标题放在登录框内 */}
          <LoginTitle />

          <Form
            layout="vertical"
            size="large"
            initialValues={{ username: '', password: '' }}
            onFinish={(values: { username: string; password: string }) => {
              setIsLoginLoading(true);
              login(
                { username: values.username, password: values.password },
                {
                  onSuccess: () => {
                    message.success(t('auth.loginSuccess'));
                  },
                  onError: (error: any) => {
                    const errorMessage = 
                      error?.message || 
                      error?.error?.message ||
                      t('auth.loginFailedCheck');
                    message.error(errorMessage);
                  },
                  onSettled: () => {
                    setIsLoginLoading(false);
                  },
                },
              );
            }}
          >
            <Form.Item
              label={<span className="text-gray-700 font-medium">{t('auth.usernameOrEmail')}</span>}
              name="username"
              rules={[{ required: true, message: t('auth.usernameOrEmailRequired') }]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />}
                autoComplete="username" 
                placeholder={t('auth.usernameOrEmailPlaceholder')}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium">{t('auth.password')}</span>}
              name="password"
              rules={[{ required: true, message: t('auth.passwordRequired') }]}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-400" />}
                autoComplete="current-password" 
                placeholder={t('auth.passwordPlaceholder')}
              />
            </Form.Item>

            <Form.Item className="mb-0 mt-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoginLoading}
                block
                size="large"
              >
                {t('auth.login')}
              </Button>
            </Form.Item>
          </Form>

          {isEnabled && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <WechatLoginButton loading={loading} onClick={handleWechatLogin} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
