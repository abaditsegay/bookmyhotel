import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import SubmissionErrorModal from '../components/common/SubmissionErrorModal';
import { getErrorMessage, getErrorTitle } from '../utils/errorHandler';

interface SubmissionErrorOptions {
  title?: string;
  fallbackMessage?: string;
}

interface SubmissionErrorState {
  open: boolean;
  title: string;
  message: string;
}

interface SubmissionErrorContextType {
  showSubmissionError: (error: unknown, options?: SubmissionErrorOptions) => void;
  hideSubmissionError: () => void;
}

const DEFAULT_TITLE = 'Unable to complete action';
const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

const SubmissionErrorContext = createContext<SubmissionErrorContextType | undefined>(undefined);

export const useSubmissionError = (): SubmissionErrorContextType => {
  const context = useContext(SubmissionErrorContext);
  if (!context) {
    throw new Error('useSubmissionError must be used within a SubmissionErrorProvider');
  }
  return context;
};

interface SubmissionErrorProviderProps {
  children: React.ReactNode;
}

export const SubmissionErrorProvider: React.FC<SubmissionErrorProviderProps> = ({ children }) => {
  const pendingOpenTimeoutRef = useRef<number | null>(null);
  const [state, setState] = useState<SubmissionErrorState>({
    open: false,
    title: DEFAULT_TITLE,
    message: DEFAULT_MESSAGE,
  });

  useEffect(() => {
    return () => {
      if (pendingOpenTimeoutRef.current !== null) {
        window.clearTimeout(pendingOpenTimeoutRef.current);
      }
    };
  }, []);

  const hideSubmissionError = useCallback(() => {
    if (pendingOpenTimeoutRef.current !== null) {
      window.clearTimeout(pendingOpenTimeoutRef.current);
      pendingOpenTimeoutRef.current = null;
    }

    setState((current) => ({ ...current, open: false }));
  }, []);

  const showSubmissionError = useCallback((error: unknown, options?: SubmissionErrorOptions) => {
    const fallbackMessage = options?.fallbackMessage || DEFAULT_MESSAGE;
    const message = getErrorMessage(error, fallbackMessage);
    const title = options?.title || getErrorTitle(error) || DEFAULT_TITLE;

    if (pendingOpenTimeoutRef.current !== null) {
      window.clearTimeout(pendingOpenTimeoutRef.current);
    }

    // Close the currently active dialog first so the submission error modal
    // is presented on its own instead of stacking behind the trigger dialog.
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
        bubbles: true,
      })
    );

    pendingOpenTimeoutRef.current = window.setTimeout(() => {
      setState({
        open: true,
        title,
        message,
      });
      pendingOpenTimeoutRef.current = null;
    }, 0);
  }, []);

  const value = useMemo(
    () => ({
      showSubmissionError,
      hideSubmissionError,
    }),
    [hideSubmissionError, showSubmissionError]
  );

  return (
    <SubmissionErrorContext.Provider value={value}>
      {children}
      <SubmissionErrorModal
        open={state.open}
        title={state.title}
        message={state.message}
        onClose={hideSubmissionError}
      />
    </SubmissionErrorContext.Provider>
  );
};

export default SubmissionErrorContext;