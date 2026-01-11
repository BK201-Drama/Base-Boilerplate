/**
 * 错误边界组件
 * 
 * 捕获子组件树中的 JavaScript 错误，防止整个应用崩溃
 */

import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button, Result, Typography } from 'antd';

const { Paragraph, Text } = Typography;

interface ErrorBoundaryProps {
  /** 子组件 */
  children: ReactNode;
  /** 自定义错误显示组件 */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** 错误回调 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** 是否在开发环境显示详细错误信息 */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 
 * @example
 * ```tsx
 * // 基本用法
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * // 自定义错误显示
 * <ErrorBoundary fallback={<div>出错了</div>}>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * // 使用函数形式的 fallback
 * <ErrorBoundary fallback={(error, reset) => (
 *   <div>
 *     <p>错误: {error.message}</p>
 *     <button onClick={reset}>重试</button>
 *   </div>
 * )}>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * // 错误回调
 * <ErrorBoundary onError={(error, info) => {
 *   console.error('捕获到错误:', error);
 *   // 发送到错误追踪服务
 * }}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // 调用错误回调
    this.props.onError?.(error, errorInfo);
    
    // 开发环境输出错误信息
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = import.meta.env.DEV } = this.props;

    if (hasError && error) {
      // 自定义 fallback
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.handleReset);
        }
        return fallback;
      }

      // 默认错误显示
      return (
        <Result
          status="error"
          title="页面出现错误"
          subTitle="抱歉，页面出现了一些问题，请尝试刷新页面或返回首页。"
          extra={[
            <Button type="primary" key="reload" onClick={this.handleReload}>
              刷新页面
            </Button>,
            <Button key="home" onClick={this.handleGoHome}>
              返回首页
            </Button>,
            <Button key="retry" onClick={this.handleReset}>
              重试
            </Button>,
          ]}
        >
          {showDetails && (
            <div style={{ textAlign: 'left', marginTop: 24 }}>
              <Paragraph>
                <Text strong style={{ fontSize: 16, color: '#cf1322' }}>
                  错误信息:
                </Text>
              </Paragraph>
              <Paragraph>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: 16, 
                  borderRadius: 4,
                  overflow: 'auto',
                  maxHeight: 200,
                }}>
                  {error.message}
                </pre>
              </Paragraph>
              {errorInfo?.componentStack && (
                <>
                  <Paragraph>
                    <Text strong style={{ fontSize: 16, color: '#cf1322' }}>
                      组件堆栈:
                    </Text>
                  </Paragraph>
                  <Paragraph>
                    <pre style={{ 
                      background: '#f5f5f5', 
                      padding: 16, 
                      borderRadius: 4,
                      overflow: 'auto',
                      maxHeight: 300,
                      fontSize: 12,
                    }}>
                      {errorInfo.componentStack}
                    </pre>
                  </Paragraph>
                </>
              )}
            </div>
          )}
        </Result>
      );
    }

    return children;
  }
}

export default ErrorBoundary;

