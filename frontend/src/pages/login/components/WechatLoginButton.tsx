/**
 * 微信登录按钮组件
 */

import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { WechatOutlined } from '@ant-design/icons';

interface WechatLoginButtonProps {
  loading?: boolean;
  onClick: () => void;
}

export const WechatLoginButton = ({ loading, onClick }: WechatLoginButtonProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-xs text-gray-500 mb-1">
        {t('auth.or')}
      </div>
      <Button
        type="primary"
        shape="circle"
        icon={<WechatOutlined className="!text-2xl" />}
        onClick={onClick}
        loading={loading}
        size="large"
        className="!w-14 !h-14 !bg-[#07c160] !border-[#07c160] hover:!bg-[#06ad56] hover:!border-[#06ad56]"
      />
    </div>
  );
};
