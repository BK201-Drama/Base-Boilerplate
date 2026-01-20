import { AuthPage } from '@refinedev/antd';
import { useLogin, useGetIdentity } from '@refinedev/core';
import { Button, Space, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { projectInfo } from '@/config';
import { authRepository } from '@/repository';

// 检查是否启用微信登录
const isWechatLoginEnabled = import.meta.env.VITE_ENABLE_WECHAT_LOGIN === 'true';

export const Login = () => {
  const { i18n, t } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'zh';
  const { mutate: login } = useLogin();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleWechatCallback = useCallback(async (code: string, state?: string) => {
    setLoading(true);
    try {
      const result = await authRepository.wechatLogin(code, state);
      if (result) {
        localStorage.setItem('token', result.access_token);
        localStorage.setItem('user', JSON.stringify(result.user));
        navigate('/');
        window.location.reload();
      } else {
        console.error(t('auth.wechatLoginFailed'));
      }
    } catch (error) {
      console.error(t('auth.wechatLoginError'), error);
    } finally {
      setLoading(false);
    }
  }, [navigate, t]);

  // 处理微信回调
  useEffect(() => {
    if (!isWechatLoginEnabled) {
      return;
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code) {
      handleWechatCallback(code, state || undefined);
    }
  }, [searchParams, handleWechatCallback]);

  const handleWechatLogin = async () => {
    try {
      const redirectUri = `${window.location.origin}/login`;
      const authUrl = await authRepository.getWechatAuthUrl(redirectUri);
      window.location.href = authUrl;
    } catch (error) {
      console.error(t('auth.wechatAuthUrlError'), error);
    }
  };

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
          <h1>{projectInfo.name[locale]}</h1>
          <p>{projectInfo.welcome[locale]}</p>
        </div>
      }
      renderContent={(content) => (
        <div>
          {content}
          {isWechatLoginEnabled && (
            <>
              <Divider>{t('auth.or')}</Divider>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  block
                  icon={<span style={{ marginRight: 8 }}>🔗</span>}
                  onClick={handleWechatLogin}
                  loading={loading}
                  style={{
                    backgroundColor: '#07c160',
                    borderColor: '#07c160',
                    height: '40px',
                  }}
                >
                  {t('auth.loginWithWechat')}
                </Button>
              </Space>
            </>
          )}
        </div>
      )}
    />
  );
};
