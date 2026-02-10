/**
 * Utility functions for parsing User Agent and extracting device information
 */

export interface DeviceInfo {
  device: string;
  browser: string;
  os: string;
}

/**
 * Parse User Agent string and extract device, browser, and OS information
 */
export function parseUserAgent(userAgent: string | null | undefined): DeviceInfo {
  if (!userAgent) {
    return {
      device: 'Unknown',
      browser: 'Unknown',
      os: 'Unknown',
    };
  }

  const ua = userAgent.toLowerCase();

  return {
    device: detectDevice(ua),
    browser: detectBrowser(ua),
    os: detectOS(ua),
  };
}

/**
 * Detect device type from user agent
 */
function detectDevice(ua: string): string {
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return 'Mobile';
  }
  
  return 'Desktop';
}

/**
 * Detect browser from user agent
 */
function detectBrowser(ua: string): string {
  if (ua.includes('edg/')) {
    return 'Edge';
  }
  
  if (ua.includes('opr/') || ua.includes('opera')) {
    return 'Opera';
  }
  
  if (ua.includes('chrome') && !ua.includes('edg')) {
    return 'Chrome';
  }
  
  if (ua.includes('safari') && !ua.includes('chrome')) {
    return 'Safari';
  }
  
  if (ua.includes('firefox')) {
    return 'Firefox';
  }
  
  if (ua.includes('msie') || ua.includes('trident/')) {
    return 'Internet Explorer';
  }
  
  if (ua.includes('samsung')) {
    return 'Samsung Browser';
  }
  
  return 'Unknown';
}

/**
 * Detect operating system from user agent
 */
function detectOS(ua: string): string {
  if (ua.includes('windows nt 10')) {
    return 'Windows 10';
  }
  
  if (ua.includes('windows nt 11')) {
    return 'Windows 11';
  }
  
  if (ua.includes('windows')) {
    return 'Windows';
  }
  
  if (ua.includes('mac os x')) {
    const version = ua.match(/mac os x ([\d_]+)/)?.[1];
    if (version) {
      return `macOS ${version.replace(/_/g, '.')}`;
    }
    return 'macOS';
  }
  
  if (ua.includes('android')) {
    const version = ua.match(/android ([\d.]+)/)?.[1];
    if (version) {
      return `Android ${version}`;
    }
    return 'Android';
  }
  
  if (ua.includes('iphone') || ua.includes('ipad')) {
    const version = ua.match(/os ([\d_]+)/)?.[1];
    if (version) {
      return `iOS ${version.replace(/_/g, '.')}`;
    }
    return 'iOS';
  }
  
  if (ua.includes('linux')) {
    return 'Linux';
  }
  
  if (ua.includes('ubuntu')) {
    return 'Ubuntu';
  }
  
  if (ua.includes('chromeos')) {
    return 'Chrome OS';
  }
  
  return 'Unknown';
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string | null {
  const headers = request.headers;
  
  // Try various headers that might contain the real IP
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfIP = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfIP) {
    return cfIP;
  }
  
  return null;
}

/**
 * Format device info for display
 */
export function formatDeviceInfo(info: DeviceInfo): string {
  return `${info.device} • ${info.browser} • ${info.os}`;
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  const info = parseUserAgent(userAgent);
  return info.device === 'Mobile' || info.device === 'Tablet';
}

/**
 * Get simplified device name
 */
export function getSimplifiedDeviceName(userAgent: string | null | undefined): string {
  const info = parseUserAgent(userAgent);
  
  if (info.device === 'Mobile' && info.os.includes('iOS')) {
    return 'iPhone';
  }
  
  if (info.device === 'Tablet' && info.os.includes('iOS')) {
    return 'iPad';
  }
  
  if (info.device === 'Mobile' && info.os.includes('Android')) {
    return 'Android Phone';
  }
  
  if (info.device === 'Tablet' && info.os.includes('Android')) {
    return 'Android Tablet';
  }
  
  if (info.device === 'Desktop' && info.os.includes('Windows')) {
    return 'Windows PC';
  }
  
  if (info.device === 'Desktop' && info.os.includes('macOS')) {
    return 'Mac';
  }
  
  if (info.device === 'Desktop' && info.os.includes('Linux')) {
    return 'Linux PC';
  }
  
  return info.device;
}
