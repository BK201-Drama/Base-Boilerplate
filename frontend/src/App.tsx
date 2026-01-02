import { Refine } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import {
  ErrorComponent,
  useNotificationProvider,
} from '@refinedev/antd';
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from '@refinedev/react-router';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import '@refinedev/antd/dist/reset.css';
import { useTranslation } from 'react-i18next';
import './i18n';

import { dataProvider } from './providers/dataProvider';
import { authProvider } from './providers/authProvider';
import { Layout } from './components/layout';
import { Login } from './pages/login';
import { Dashboard } from './pages/dashboard';

function App() {
  const { i18n, t } = useTranslation();
  const antdLocale = i18n.language === 'en' ? enUS : zhCN;

  return (
    <BrowserRouter>
      <ConfigProvider locale={antdLocale}>
        <RefineKbarProvider>
          <AntdApp>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              routerProvider={routerBindings}
              notificationProvider={useNotificationProvider()}
              resources={[
                {
                  name: 'dashboard',
                  list: '/',
                  meta: {
                    label: t('common.dashboard'),
                    icon: '📊',
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                projectId: 'base-boilerplate',
              }}
            >
              <Routes>
                <Route
                  element={
                    <Layout>
                      <Outlet />
                    </Layout>
                  }
                >
                  <Route index element={<Dashboard />} />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<ErrorComponent />} />
              </Routes>
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </AntdApp>
        </RefineKbarProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
