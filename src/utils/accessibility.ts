/**
 * 4CORE Accessibility Utilities
 * Helper functions for improving accessibility across the application
 */

/**
 * Generate a unique ID for accessibility purposes
 */
export const generateAriaId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get ARIA attributes for a button
 */
export const getButtonAriaProps = (
  label: string,
  isDisabled?: boolean,
  isLoading?: boolean
): React.ButtonHTMLAttributes<HTMLButtonElement> => {
  return {
    'aria-label': label,
    'aria-disabled': isDisabled || isLoading,
    role: 'button',
  };
};

/**
 * Get ARIA attributes for a form input
 */
export const getInputAriaProps = (
  id: string,
  label: string,
  error?: string,
  isRequired?: boolean
): React.InputHTMLAttributes<HTMLInputElement> => {
  return {
    id,
    'aria-label': label,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : undefined,
    'aria-required': isRequired,
  };
};

/**
 * Get ARIA attributes for a modal
 */
export const getModalAriaProps = (
  title: string,
  isOpen: boolean
): React.HTMLAttributes<HTMLDivElement> => {
  return {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': `${title}-title`,
    'aria-hidden': !isOpen,
  };
};

/**
 * Get ARIA attributes for a live region
 */
export const getLiveRegionProps = (
  politeness: 'polite' | 'assertive' | 'off' = 'polite'
): React.HTMLAttributes<HTMLDivElement> => {
  return {
    'aria-live': politeness,
    'aria-atomic': 'true',
  };
};

/**
 * Handle keyboard navigation for custom components
 */
export const handleKeyboardNavigation = (
  event: React.KeyboardEvent,
  actions: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
  }
): void => {
  const { key } = event;

  switch (key) {
    case 'Enter':
      event.preventDefault();
      actions.onEnter?.();
      break;
    case ' ':
      event.preventDefault();
      actions.onSpace?.();
      break;
    case 'Escape':
      event.preventDefault();
      actions.onEscape?.();
      break;
    case 'ArrowUp':
      event.preventDefault();
      actions.onArrowUp?.();
      break;
    case 'ArrowDown':
      event.preventDefault();
      actions.onArrowDown?.();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      actions.onArrowLeft?.();
      break;
    case 'ArrowRight':
      event.preventDefault();
      actions.onArrowRight?.();
      break;
    case 'Home':
      event.preventDefault();
      actions.onHome?.();
      break;
    case 'End':
      event.preventDefault();
      actions.onEnd?.();
      break;
  }
};

/**
 * Create a focus trap for modals
 */
export const createFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  onEscape?: () => void
): void => {
  const focusableElements = containerRef.current?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (!focusableElements || focusableElements.length === 0) return;

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    } else if (event.key === 'Escape' && onEscape) {
      onEscape();
    }
  };

  containerRef.current?.addEventListener('keydown', handleKeyDown);
  firstElement.focus();

  return () => {
    containerRef.current?.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Announce a message to screen readers
 */
export const announceToScreenReader = (message: string, politeness: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', politeness);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if an element is focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  if (element.tabIndex < 0) return false;
  if (element.disabled) return false;

  const focusableTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'];
  if (focusableTags.includes(element.tagName)) return true;

  return element.getAttribute('tabindex') !== null;
};

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  return Array.from(focusableElements).filter(
    (element) => !element.hasAttribute('disabled') && (element as HTMLElement).offsetParent !== null
  ) as HTMLElement[];
};

/**
 * Set focus to the first focusable element in a container
 */
export const setFocusToFirst = (container: HTMLElement): void => {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
};

/**
 * Create a skip to main content link
 */
export const createSkipLink = (targetId: string, label: string = 'Skip to main content'): HTMLElement => {
  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.textContent = label;
  link.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg';
  link.setAttribute('aria-label', label);

  return link;
};

/**
 * Validate color contrast ratio (WCAG AA standard: 4.5:1 for normal text, 3:1 for large text)
 */
export const validateContrastRatio = (
  foreground: string,
  background: string,
  isLargeText: boolean = false
): { passes: boolean; ratio: number } => {
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const a = [r, g, b].map((v) => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  const minimumRatio = isLargeText ? 3 : 4.5;

  return {
    passes: ratio >= minimumRatio,
    ratio: Math.round(ratio * 100) / 100,
  };
};

/**
 * Get accessible color for text based on background
 */
export const getAccessibleTextColor = (backgroundColor: string): string => {
  const { passes } = validateContrastRatio('#ffffff', backgroundColor);
  return passes ? '#ffffff' : '#000000';
};
