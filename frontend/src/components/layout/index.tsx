import { ThemedLayout } from '@refinedev/antd';
import { Header } from './header';
import { Title } from './title';

export const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <ThemedLayout
      Header={() => <Header />}
      Title={({ collapsed }) => <Title collapsed={collapsed} />}
    >
      {children}
    </ThemedLayout>
  );
};

