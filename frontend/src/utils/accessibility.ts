/**
 * Accessibility utilities for improving a11y across the application
 */

/**
 * Generate accessible button props with proper ARIA labels
 */
export const getAccessibleButtonProps = (action: string, target?: string) => ({
  'aria-label': target ? `${action} ${target}` : action,
  role: 'button',
});

/**
 * Generate accessible icon button props
 */
export const getAccessibleIconButtonProps = (action: string, target?: string, disabled = false) => ({
  'aria-label': target ? `${action} ${target}` : action,
  'aria-disabled': disabled,
  role: 'button',
  tabIndex: disabled ? -1 : 0,
});

/**
 * Generate accessible dialog props
 */
export const getAccessibleDialogProps = (title: string) => ({
  'aria-labelledby': `${title.toLowerCase().replace(/\s+/g, '-')}-dialog-title`,
  'aria-describedby': `${title.toLowerCase().replace(/\s+/g, '-')}-dialog-description`,
  role: 'dialog',
  'aria-modal': true,
});

/**
 * Generate accessible form field props
 */
export const getAccessibleFormFieldProps = (
  label: string,
  error?: string,
  required = false
) => ({
  'aria-label': label,
  'aria-required': required,
  'aria-invalid': !!error,
  'aria-describedby': error ? `${label.toLowerCase().replace(/\s+/g, '-')}-error` : undefined,
});

/**
 * Generate accessible loading props for screen readers
 */
export const getAccessibleLoadingProps = (message = 'Loading') => ({
  role: 'status',
  'aria-live': 'polite' as const,
  'aria-busy': true,
  'aria-label': message,
});

/**
 * Generate accessible error props for screen readers
 */
export const getAccessibleErrorProps = (message: string) => ({
  role: 'alert',
  'aria-live': 'assertive' as const,
  'aria-atomic': true,
  'aria-label': `Error: ${message}`,
});

/**
 * Generate accessible table props
 */
export const getAccessibleTableProps = (caption: string) => ({
  'aria-label': caption,
  role: 'table',
});

/**
 * Generate accessible link props
 */
export const getAccessibleLinkProps = (destination: string, external = false) => ({
  'aria-label': `Navigate to ${destination}`,
  ...(external && {
    'aria-label': `Navigate to ${destination} (opens in new tab)`,
    rel: 'noopener noreferrer',
    target: '_blank',
  }),
});

/**
 * Announce message to screen readers dynamically
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only'; // Visually hidden
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after screen reader has time to read it
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Focus management - trap focus within modal/dialog
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');
  
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
};

/**
 * Setup focus trap for modal/dialog
 */
export const setupFocusTrap = (container: HTMLElement) => {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleKeyDown);
  
  // Focus first element
  firstElement?.focus();
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Check if element is visible to screen readers
 */
export const isVisibleToScreenReader = (element: HTMLElement): boolean => {
  return (
    !element.hasAttribute('aria-hidden') &&
    element.getAttribute('aria-hidden') !== 'true' &&
    !element.hidden
  );
};

/**
 * Generate skip link props for keyboard navigation
 */
export const getSkipLinkProps = (targetId: string) => ({
  href: `#${targetId}`,
  'aria-label': `Skip to ${targetId.replace('-', ' ')}`,
  className: 'skip-link',
});
