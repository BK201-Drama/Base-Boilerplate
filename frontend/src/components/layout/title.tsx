import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { projectInfo } from '@/config';

const { Title: AntTitle } = Typography;

export const Title = ({ collapsed }: { collapsed: boolean }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'zh';
  
  // 从配置文件获取项目名称
  const appName = collapsed 
    ? projectInfo.nameShort[locale]
    : projectInfo.name[locale];

  return (
    <div
      className={`text-center transition-all duration-300 bg-gradient-to-br from-primary-start to-primary-end ${
        collapsed ? 'p-2 m-2 rounded-lg' : 'p-4 m-0 rounded-none'
      }`}
    >
      <AntTitle
        level={4}
        className={`m-0 text-white font-semibold transition-all duration-300 drop-shadow-sm ${
          collapsed ? 'text-sm' : 'text-lg'
        }`}
      >
        {appName}
      </AntTitle>
    </div>
  );
};
