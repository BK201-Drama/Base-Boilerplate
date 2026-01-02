import { AuthPage } from '@refinedev/antd';
import { useTranslation } from 'react-i18next';

export const Login = () => {
  const { t } = useTranslation();

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
          <h1>{t('common.appName')}</h1>
          <p>{t('common.welcome')}</p>
        </div>
      }
    />
  );
};



