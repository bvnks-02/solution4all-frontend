import { collection } from './api';

const ANALYTICS_ENABLED = true; // hardcoded (no env var)

function getDeviceType() {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function getSessionId() {
  let id = sessionStorage.getItem('s4a_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('s4a_session_id', id);
  }
  return id;
}

export async function trackEvent(event_type, page_path, event_label = '') {
  if (!ANALYTICS_ENABLED) return;
  try {
    await collection('analytics_events').create({
      event_type,
      page_path,
      event_label,
      referrer: document.referrer,
      session_id: getSessionId(),
      device_type: getDeviceType(),
    });
  } catch (e) {
    // Fail silently — analytics must never break the UI
  }
}
