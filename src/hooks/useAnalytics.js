import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

export function useAnalytics() {
  const location = useLocation();
  useEffect(() => {
    trackEvent('page_view', location.pathname);
  }, [location.pathname]);
}
