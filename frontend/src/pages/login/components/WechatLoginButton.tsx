/**
 * 微信登录按钮组件
 */

import { Button, Space, Divider } from 'antd';
import { useTranslation } from 'react-i18next';

interface WechatLoginButtonProps {
  loading?: boolean;
  onClick: () => void;
}

export const WechatLoginButton = ({ loading, onClick }: WechatLoginButtonProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Divider>{t('auth.or')}</Divider>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type="primary"
          block
          icon={<span style={{ marginRight: 8 }}>🔗</span>}
          onClick={onClick}
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
  );
};
