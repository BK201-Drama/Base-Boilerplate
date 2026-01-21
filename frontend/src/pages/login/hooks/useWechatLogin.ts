/**
 * 微信登录 Hook
 * 
 * 处理微信登录相关的逻辑：
 * - 检查是否启用微信登录
 * - 处理微信 OAuth 回调
 * - 处理微信登录跳转
 */

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authRepository } from '@/repository';

// 检查是否启用微信登录
const isWechatLoginEnabled = import.meta.env.VITE_ENABLE_WECHAT_LOGIN === 'true';

export const useWechatLogin = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 处理微信登录回调
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

  // 处理微信登录跳转
  const handleWechatLogin = useCallback(async () => {
    try {
      const redirectUri = `${window.location.origin}/login`;
      const authUrl = await authRepository.getWechatAuthUrl(redirectUri);
      window.location.href = authUrl;
    } catch (error) {
      console.error(t('auth.wechatAuthUrlError'), error);
    }
  }, [t]);

  // 监听 URL 参数，处理微信回调
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

  return {
    isEnabled: isWechatLoginEnabled,
    loading,
    handleWechatLogin,
  };
};
