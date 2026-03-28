import React from 'react';
import { useTranslation } from 'react-i18next';

import EmptyState from './EmptyState';
import StandardError from './StandardError';
import StandardLoading from './StandardLoading';

interface DataStateProps {
  loading: boolean;
  error?: unknown;
  isEmpty?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  errorTitle?: string;
  fallbackErrorMessage?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
    variant?: 'text' | 'outlined' | 'contained';
  };
  minHeight?: string | number;
  onRetry?: () => void;
  children: React.ReactNode;
}

const DataState: React.FC<DataStateProps> = ({
  loading,
  error,
  isEmpty = false,
  loadingMessage,
  errorMessage,
  errorTitle,
  fallbackErrorMessage,
  emptyTitle,
  emptyMessage,
  emptyAction,
  minHeight,
  onRetry,
  children,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return <StandardLoading loading message={loadingMessage} minHeight={minHeight} />;
  }

  if (error) {
    return (
      <StandardError
        error
        errorValue={error}
        message={errorMessage}
        title={errorTitle}
        fallbackMessage={fallbackErrorMessage || errorMessage}
        showRetry={Boolean(onRetry)}
        onRetry={onRetry}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle || t('emptyStates.noDataTitle')}
        message={emptyMessage || t('emptyStates.noDataMessage')}
        action={emptyAction}
        sx={{
          minHeight,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      />
    );
  }

  return <>{children}</>;
};

export default DataState;