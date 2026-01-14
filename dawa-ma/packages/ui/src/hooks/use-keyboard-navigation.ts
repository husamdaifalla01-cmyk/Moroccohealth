import { useEffect, useCallback, useState } from 'react';

export interface KeyboardNavigationOptions {
  /** Total number of items */
  itemCount: number;
  /** Callback when item is selected via Enter/Space */
  onSelect?: (index: number) => void;
  /** Callback when index changes */
  onIndexChange?: (index: number) => void;
  /** Whether navigation is enabled */
  enabled?: boolean;
  /** Loop navigation at boundaries */
  loop?: boolean;
  /** Custom key handlers */
  customKeys?: Record<string, (index: number) => void>;
}

/**
 * Keyboard-first navigation hook for queue lists
 * Supports J/K (vim-style), Arrow keys, Enter/Space for selection
 */
export function useKeyboardNavigation({
  itemCount,
  onSelect,
  onIndexChange,
  enabled = true,
  loop = true,
  customKeys = {},
}: KeyboardNavigationOptions) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigateNext = useCallback(() => {
    setSelectedIndex((current) => {
      const next = current + 1;
      if (next >= itemCount) {
        return loop ? 0 : current;
      }
      return next;
    });
  }, [itemCount, loop]);

  const navigatePrev = useCallback(() => {
    setSelectedIndex((current) => {
      const prev = current - 1;
      if (prev < 0) {
        return loop ? itemCount - 1 : 0;
      }
      return prev;
    });
  }, [itemCount, loop]);

  const navigateToIndex = useCallback((index: number) => {
    if (index >= 0 && index < itemCount) {
      setSelectedIndex(index);
    }
  }, [itemCount]);

  const selectCurrent = useCallback(() => {
    onSelect?.(selectedIndex);
  }, [onSelect, selectedIndex]);

  useEffect(() => {
    onIndexChange?.(selectedIndex);
  }, [selectedIndex, onIndexChange]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Check custom keys first
      const customHandler = customKeys[event.key];
      if (customHandler) {
        event.preventDefault();
        customHandler(selectedIndex);
        return;
      }

      switch (event.key) {
        case 'j':
        case 'ArrowDown':
          event.preventDefault();
          navigateNext();
          break;
        case 'k':
        case 'ArrowUp':
          event.preventDefault();
          navigatePrev();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          selectCurrent();
          break;
        case 'Home':
          event.preventDefault();
          navigateToIndex(0);
          break;
        case 'End':
          event.preventDefault();
          navigateToIndex(itemCount - 1);
          break;
        case 'g':
          if (event.shiftKey) {
            event.preventDefault();
            navigateToIndex(itemCount - 1);
          } else {
            event.preventDefault();
            navigateToIndex(0);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, customKeys, navigateNext, navigatePrev, selectCurrent, navigateToIndex, itemCount, selectedIndex]);

  // Reset index if item count changes
  useEffect(() => {
    if (selectedIndex >= itemCount && itemCount > 0) {
      setSelectedIndex(itemCount - 1);
    }
  }, [itemCount, selectedIndex]);

  return {
    selectedIndex,
    setSelectedIndex: navigateToIndex,
    navigateNext,
    navigatePrev,
    selectCurrent,
  };
}
