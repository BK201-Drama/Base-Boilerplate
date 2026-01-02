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

import { dataProvider, authProvider } from './providers';
import { Layout } from './components/layout';
import { Login } from './pages/login';
import { Dashboard } from './pages/dashboard';
import { UserList, UserCreate, UserEdit, UserShow } from './pages/users';

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
                {
                  name: 'users',
                  list: '/users',
                  create: '/users/create',
                  edit: '/users/edit/:id',
                  show: '/users/show/:id',
                  meta: {
                    label: '用户管理',
                    icon: '👥',
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
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
                  <Route path="/users">
                    <Route index element={<UserList />} />
                    <Route path="create" element={<UserCreate />} />
                    <Route path="edit/:id" element={<UserEdit />} />
                    <Route path="show/:id" element={<UserShow />} />
                  </Route>
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
