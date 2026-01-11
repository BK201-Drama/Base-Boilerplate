import { Authenticated, Refine } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import {
  ErrorComponent,
  useNotificationProvider,
} from '@refinedev/antd';
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from '@refinedev/react-router';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import '@refinedev/antd/dist/reset.css';
import { useTranslation } from 'react-i18next';
import './i18n';

import { dataProvider, authProvider } from './providers';
import { Layout } from './components/layout';
import { ErrorBoundary } from './components/error';
import { 
  getResources,
  getProtectedRoutes,
  getPublicRoutes,
  getRefineOptions,
  lightTheme,
} from './config';

function App() {
  const { i18n, t } = useTranslation();
  const antdLocale = i18n.language === 'en' ? enUS : zhCN;

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ConfigProvider locale={antdLocale} theme={lightTheme}>
          <RefineKbarProvider>
            <AntdApp>
              <Refine
                dataProvider={dataProvider}
                authProvider={authProvider}
                routerProvider={routerBindings}
                notificationProvider={useNotificationProvider()}
                resources={getResources(t)}
                options={getRefineOptions()}
              >
                <Routes>
                  {/* 受保护的路由 */}
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-routes"
                        fallback={<CatchAllNavigate to="/login" />}
                        loading={
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: '100vh' 
                          }}>
                            <Spin size="large" />
                          </div>
                        }
                      >
                        <Layout>
                          <Outlet />
                        </Layout>
                      </Authenticated>
                    }
                  >
                    {getProtectedRoutes()}
                  </Route>
                  {/* 公共路由 */}
                  {getPublicRoutes()}
                  {/* 404 路由 */}
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
    </ErrorBoundary>
  );
}

export default App;
