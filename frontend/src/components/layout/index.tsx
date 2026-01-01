import { ThemedLayoutV2 } from '@refinedev/antd';
import { Header } from './header';
import { Title } from './title';

export const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <ThemedLayoutV2
      Header={() => <Header />}
      Title={({ collapsed }) => <Title collapsed={collapsed} />}
    >
      {children}
    </ThemedLayoutV2>
  );
};

