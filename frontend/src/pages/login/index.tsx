import { AuthPage } from '@refinedev/antd';
import { useTranslation } from 'react-i18next';
import { projectInfo } from '@/config';

export const Login = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'zh';

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
    />
  );
};
