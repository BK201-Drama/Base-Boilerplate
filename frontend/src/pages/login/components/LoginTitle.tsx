/**
 * 登录页面标题组件
 */

import { useTranslation } from 'react-i18next';
import { projectInfo } from '@/config';

export const LoginTitle = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'zh';

  return (
    <div className="text-center mb-6">
      <h1>{projectInfo.name[locale]}</h1>
      <p>{projectInfo.welcome[locale]}</p>
    </div>
  );
};
