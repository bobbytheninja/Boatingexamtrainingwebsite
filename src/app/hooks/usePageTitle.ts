import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
    return () => {
      document.title = 'Black Sea Bulgaria - Yacht & Boat Exam Training | Practice Tests Online';
    };
  }, [title]);
}
