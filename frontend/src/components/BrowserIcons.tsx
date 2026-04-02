interface BrowserIconProps {
  className?: string;
}

export function ChromeIcon({ className = "h-5 w-5" }: BrowserIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#DB4437"/>
      <circle cx="12" cy="12" r="7" fill="#F4B400"/>
      <circle cx="12" cy="12" r="4.5" fill="white"/>
      <circle cx="12" cy="12" r="3" fill="#4285F4"/>
      <path d="M12 2C6.477 2 2 6.477 2 12h7c0-1.657 1.343-3 3-3h10c0-5.523-4.477-10-10-10z" fill="#0F9D58"/>
      <path d="M2 12c0 5.523 4.477 10 10 10l5-8.66H9c-1.657 0-3-1.343-3-3L2 12z" fill="#F4B400"/>
      <path d="M22 12h-5l-5 8.66c5.523 0 10-4.477 10-10z" fill="#DB4437"/>
    </svg>
  );
}

export function FirefoxIcon({ className = "h-5 w-5" }: BrowserIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="url(#firefox-gradient)"/>
      <path d="M19 8c-1-2-2.5-3.5-4.5-4.5C16 5 16.5 7 16 9c-.5 2-2 3.5-4 4-2 .5-4 0-5.5-1.5-1.5-1.5-2-3.5-1.5-5.5C3 7 2 9 2 11.5c0 5.5 4.5 10 10 10s10-4.5 10-10c0-1.5-.5-3-1-4z" fill="#FF6611"/>
      <ellipse cx="10" cy="10" rx="3" ry="4" fill="#FF9500" opacity="0.8"/>
      <defs>
        <linearGradient id="firefox-gradient" x1="12" y1="2" x2="12" y2="22">
          <stop offset="0%" stopColor="#FF9500"/>
          <stop offset="100%" stopColor="#FF6611"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SafariIcon({ className = "h-5 w-5" }: BrowserIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="url(#safari-gradient)"/>
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="0.5" fill="none"/>
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.343 6.343l1.414 1.414M16.243 16.243l1.414 1.414M6.343 17.657l1.414-1.414M16.243 7.757l1.414-1.414" stroke="white" strokeWidth="0.8" strokeLinecap="round"/>
      <path d="M12 7L10 12L12 17L14 12Z" fill="white"/>
      <path d="M7 12L12 10L17 12L12 14Z" fill="#E63946" opacity="0.8"/>
      <defs>
        <linearGradient id="safari-gradient" x1="12" y1="2" x2="12" y2="22">
          <stop offset="0%" stopColor="#38BDF8"/>
          <stop offset="100%" stopColor="#0284C7"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export function EdgeIcon({ className = "h-5 w-5" }: BrowserIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="url(#edge-gradient)"/>
      <path d="M12 2c-3.5 0-6.5 1.8-8.3 4.5C5.5 4.8 7.8 4 10.5 4c3.2 0 5.8 1.5 7.2 3.8.8 1.3 1.3 2.8 1.3 4.2 0 2.5-1.2 4.8-3 6.3 4-1 7-4.5 7-8.8 0-5-4-9-10-9z" fill="#0078D4"/>
      <path d="M12 22c5.5 0 10-4.5 10-10 0-1.5-.3-2.8-.8-4.2-1.5 2.5-4.2 4.2-7.2 4.2-3.5 0-6.5-2-7.8-5C5 8.5 4 10.2 4 12c0 5.5 4.5 10 8 10z" fill="url(#edge-wave)"/>
      <defs>
        <linearGradient id="edge-gradient" x1="2" y1="12" x2="22" y2="12">
          <stop offset="0%" stopColor="#0078D4"/>
          <stop offset="100%" stopColor="#00BCF2"/>
        </linearGradient>
        <linearGradient id="edge-wave" x1="4" y1="12" x2="14" y2="22">
          <stop offset="0%" stopColor="#00BCF2"/>
          <stop offset="100%" stopColor="#0078D4"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BraveIcon({ className = "h-5 w-5" }: BrowserIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="url(#brave-gradient)"/>
      <path d="M12 3l2 3h2l1 2-1 2 1 3-2 4-3 2-3-2-2-4 1-3-1-2 1-2h2l2-3z" fill="white"/>
      <path d="M12 6l1.5 2h1l.5 1-.5 1 .5 2-1 2.5-1.5 1-1.5-1-1-2.5.5-2-.5-1 .5-1h1L12 6z" fill="#FB542B"/>
      <circle cx="12" cy="11" r="1" fill="white"/>
      <defs>
        <linearGradient id="brave-gradient" x1="12" y1="2" x2="12" y2="22">
          <stop offset="0%" stopColor="#FB542B"/>
          <stop offset="100%" stopColor="#D03620"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ArcIcon({ className = "h-5 w-5" }: BrowserIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="arc-gradient" x1="2" y1="2" x2="22" y2="22">
          <stop offset="0%" stopColor="#FF6B6B"/>
          <stop offset="25%" stopColor="#A855F7"/>
          <stop offset="50%" stopColor="#4F46E5"/>
          <stop offset="75%" stopColor="#06B6D4"/>
          <stop offset="100%" stopColor="#10B981"/>
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#arc-gradient)"/>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 2.5.9 4.8 2.5 6.5l7-7c.3-.3.5-.7.5-1.1V4.5c0-.8-.5-1.5-1.3-1.8C11.1 2.2 11.5 2 12 2z" fill="white" opacity="0.9"/>
      <path d="M12 2v8.4c0 .4-.2.8-.5 1.1l-7 7C6.2 20.1 8.9 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="white" opacity="0.15"/>
    </svg>
  );
}

export function DefaultBrowserIcon({ className = "h-5 w-5" }: BrowserIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#6B7280"/>
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z" fill="#9CA3AF"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.3"/>
      <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export const BROWSER_ICON_COMPONENTS = {
  chrome: ChromeIcon,
  firefox: FirefoxIcon,
  safari: SafariIcon,
  edge: EdgeIcon,
  brave: BraveIcon,
  arc: ArcIcon,
};
