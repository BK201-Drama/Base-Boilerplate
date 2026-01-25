/**
 * 登录页面标题组件
 */

import { useTranslation } from 'react-i18next';
import { projectInfo } from '@/config';

export const LoginTitle = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'zh';

  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        {projectInfo.name[locale]}
      </h1>
      <p className="text-sm text-gray-500">
        {projectInfo.welcome[locale]}
      </p>
    </div>
  );
};
