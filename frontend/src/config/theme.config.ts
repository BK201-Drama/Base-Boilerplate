/**
 * Ant Design 主题配置
 * 
 * 可以在这里自定义主题色、圆角、字体等
 * 文档：https://ant.design/docs/react/customize-theme-cn
 */

import type { ThemeConfig } from 'antd';

// 品牌色
const brandPrimary = '#1677ff';
const brandSuccess = '#52c41a';
const brandWarning = '#faad14';
const brandError = '#ff4d4f';
const brandInfo = '#1677ff';

/**
 * 默认主题配置（亮色）
 */
export const lightTheme: ThemeConfig = {
  token: {
    // 品牌色
    colorPrimary: brandPrimary,
    colorSuccess: brandSuccess,
    colorWarning: brandWarning,
    colorError: brandError,
    colorInfo: brandInfo,
    
    // 圆角
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    
    // 字体
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
      'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
      'Noto Color Emoji'`,
    fontSize: 14,
    
    // 动画
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
    
    // 布局
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,
  },
  components: {
    // 布局组件
    Layout: {
      headerBg: '#fff',
      headerHeight: 64,
      siderBg: '#001529',
    },
    // 菜单组件
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
    },
    // 表格组件
    Table: {
      headerBg: '#fafafa',
      rowHoverBg: '#fafafa',
    },
    // 按钮组件
    Button: {
      primaryShadow: '0 2px 0 rgba(5, 145, 255, 0.1)',
    },
    // 卡片组件
    Card: {
      headerBg: 'transparent',
    },
  },
};

/**
 * 暗色主题配置
 */
export const darkTheme: ThemeConfig = {
  token: {
    // 品牌色
    colorPrimary: brandPrimary,
    colorSuccess: brandSuccess,
    colorWarning: brandWarning,
    colorError: brandError,
    colorInfo: brandInfo,
    
    // 背景色
    colorBgContainer: '#141414',
    colorBgElevated: '#1f1f1f',
    colorBgLayout: '#000000',
    
    // 文字色
    colorText: 'rgba(255, 255, 255, 0.85)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
    colorTextQuaternary: 'rgba(255, 255, 255, 0.25)',
    
    // 边框色
    colorBorder: '#424242',
    colorBorderSecondary: '#303030',
    
    // 圆角
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    
    // 字体
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
      'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
      'Noto Color Emoji'`,
    fontSize: 14,
  },
  components: {
    Layout: {
      headerBg: '#141414',
      headerHeight: 64,
      siderBg: '#001529',
    },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
    },
    Table: {
      headerBg: '#1f1f1f',
      rowHoverBg: '#262626',
    },
    Card: {
      headerBg: 'transparent',
    },
  },
};

/**
 * 紧凑主题配置
 */
export const compactTheme: ThemeConfig = {
  token: {
    // 继承默认主题色
    colorPrimary: brandPrimary,
    
    // 更小的尺寸
    fontSize: 12,
    borderRadius: 4,
    controlHeight: 28,
    controlHeightLG: 32,
    controlHeightSM: 20,
    
    // 更紧凑的间距
    padding: 12,
    paddingLG: 16,
    paddingSM: 8,
    paddingXS: 4,
    
    margin: 12,
    marginLG: 16,
    marginSM: 8,
    marginXS: 4,
  },
};

/**
 * 获取当前主题配置
 * @param isDark 是否暗色模式
 * @param isCompact 是否紧凑模式
 */
export const getThemeConfig = (
  isDark: boolean = false,
  isCompact: boolean = false
): ThemeConfig => {
  const baseTheme = isDark ? darkTheme : lightTheme;
  
  if (isCompact) {
    return {
      ...baseTheme,
      token: {
        ...baseTheme.token,
        ...compactTheme.token,
      },
    };
  }
  
  return baseTheme;
};

/**
 * 默认导出亮色主题
 */
export default lightTheme;

