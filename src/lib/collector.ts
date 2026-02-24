// ============================================
// Client-Side Data Collection Module
// Fingerprinting, behavioral tracking, referral analysis
// ============================================

// ---- Fingerprint Collection ----

export interface DeviceFingerprint {
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  pixelRatio: number;
  colorDepth: number;
  touchSupport: boolean;
  maxTouchPoints: number;
  cpuCores: number;
  deviceMemory: number | null;
  gpu: string | null;
  doNotTrack: boolean;
  cookiesEnabled: boolean;
  connectionType: string | null;
  connectionDownlink: number | null;
  timezone: string;
  timezoneOffset: number;
  languages: string[];
  platform: string;
  canvasHash: string;
  webglHash: string;
  audioHash: string;
}

export async function collectFingerprint(): Promise<DeviceFingerprint> {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { effectiveType?: string; downlink?: number };
  };

  return {
    screenWidth: screen.width,
    screenHeight: screen.height,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    colorDepth: screen.colorDepth,
    touchSupport: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    cpuCores: navigator.hardwareConcurrency || 0,
    deviceMemory: nav.deviceMemory ?? null,
    gpu: getGPUInfo(),
    doNotTrack: navigator.doNotTrack === "1",
    cookiesEnabled: navigator.cookieEnabled,
    connectionType: nav.connection?.effectiveType ?? null,
    connectionDownlink: nav.connection?.downlink ?? null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    languages: [...navigator.languages],
    platform: navigator.platform,
    canvasHash: getCanvasHash(),
    webglHash: getWebGLHash(),
    audioHash: await getAudioHash(),
  };
}

function getGPUInfo(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return null;
    const ext = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
    if (!ext) return null;
    return (gl as WebGLRenderingContext).getParameter(ext.UNMASKED_RENDERER_WEBGL) || null;
  } catch {
    return null;
  }
}

function getCanvasHash(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("Invoiceify fp", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Invoiceify fp", 4, 17);
    return simpleHash(canvas.toDataURL());
  } catch {
    return "";
  }
}

function getWebGLHash(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) return "";
    const params = [
      gl.getParameter(gl.VERSION),
      gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      gl.getParameter(gl.VENDOR),
      gl.getParameter(gl.MAX_TEXTURE_SIZE),
      gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
    ];
    return simpleHash(params.join("~"));
  } catch {
    return "";
  }
}

async function getAudioHash(): Promise<string> {
  try {
    const ctx = new OfflineAudioContext(1, 44100, 44100);
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 10000;
    const compressor = ctx.createDynamicsCompressor();
    osc.connect(compressor);
    compressor.connect(ctx.destination);
    osc.start(0);
    const buffer = await ctx.startRendering();
    const data = buffer.getChannelData(0);
    let sum = 0;
    for (let i = 4500; i < 5000; i++) sum += Math.abs(data[i]);
    return simpleHash(sum.toString());
  } catch {
    return "";
  }
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export async function generateFingerprintHash(fp: DeviceFingerprint): Promise<string> {
  const key = [
    fp.screenWidth, fp.screenHeight, fp.pixelRatio, fp.colorDepth,
    fp.cpuCores, fp.deviceMemory, fp.gpu, fp.timezone, fp.platform,
    fp.languages.join(","), fp.canvasHash, fp.webglHash, fp.audioHash,
  ].join("|");

  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---- Referral / Marketing Data ----

export interface ReferralData {
  fullReferrer: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  landingPage: string;
  searchQuery: string | null;
  trafficSource: string;
  socialPlatform: string | null;
}

export function collectReferralData(): ReferralData {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const referrer = document.referrer;

  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const utmTerm = params.get("utm_term");
  const utmContent = params.get("utm_content");

  let searchQuery: string | null = null;
  let socialPlatform: string | null = null;
  let trafficSource = "direct";

  if (referrer) {
    try {
      const refUrl = new URL(referrer);
      const refHost = refUrl.hostname.toLowerCase();

      // Detect search engines
      const searchEngines: Record<string, string> = {
        "google": "q", "bing": "q", "yahoo": "p", "duckduckgo": "q",
        "baidu": "wd", "yandex": "text",
      };
      for (const [engine, param] of Object.entries(searchEngines)) {
        if (refHost.includes(engine)) {
          trafficSource = "organic";
          searchQuery = refUrl.searchParams.get(param);
          break;
        }
      }

      // Detect social platforms
      const socials = ["facebook", "twitter", "x.com", "linkedin", "instagram", "pinterest", "reddit", "tiktok", "youtube"];
      for (const s of socials) {
        if (refHost.includes(s)) {
          trafficSource = "social";
          socialPlatform = s === "x.com" ? "twitter" : s;
          break;
        }
      }

      if (trafficSource === "direct") trafficSource = "referral";
    } catch {
      trafficSource = "referral";
    }
  }

  if (utmSource) {
    if (utmMedium === "cpc" || utmMedium === "ppc" || utmMedium === "paid") trafficSource = "paid";
    else if (utmMedium === "email") trafficSource = "email";
    else if (utmMedium === "social") trafficSource = "social";
  }

  return {
    fullReferrer: referrer,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    landingPage: window.location.pathname,
    searchQuery,
    trafficSource,
    socialPlatform,
  };
}

// ---- Behavioral Tracker ----

interface FieldTiming {
  fieldName: string;
  focusTime: number;
  blurTime?: number;
  duration?: number;
}

interface ClickEvent {
  x: number;
  y: number;
  target: string;
  t: number;
}

interface MousePoint {
  x: number;
  y: number;
  t: number;
}

export interface BehavioralSnapshot {
  fieldTimings: FieldTiming[];
  editCounts: Record<string, number>;
  fieldOrder: string[];
  pasteEvents: string[];
  typingSpeeds: Record<string, number[]>;
  scrollDepth: number;
  tabSwitches: number;
  rageClicks: number;
  copyEvents: number;
  rightClickEvents: number;
  validationErrors: number;
  duration: number;
  pageLoadTime: number;
  mouseHeatmap: MousePoint[];
  clickMap: ClickEvent[];
}

export class BehavioralTracker {
  private fieldTimings: FieldTiming[] = [];
  private editCounts: Record<string, number> = {};
  private fieldOrder: string[] = [];
  private pasteEvents: string[] = [];
  private typingSpeeds: Record<string, number[]> = {};
  private scrollDepth = 0;
  private tabSwitches = 0;
  private rageClicks = 0;
  private copyEvents = 0;
  private rightClickEvents = 0;
  private validationErrors = 0;
  private mousePositions: MousePoint[] = [];
  private clicks: ClickEvent[] = [];
  private startTime = Date.now();
  private pageLoadTime = 0;
  private lastKeyTime: Record<string, number> = {};
  private lastClickTime = 0;
  private lastClickX = 0;
  private lastClickY = 0;
  private rapidClickCount = 0;
  private mouseThrottleTimer: ReturnType<typeof setTimeout> | null = null;
  private cleanupFns: (() => void)[] = [];

  constructor() {
    this.pageLoadTime = performance.now();
    this.attachListeners();
  }

  private attachListeners() {
    // Mouse movement (throttled to 500ms, capped at 500 points)
    const onMouseMove = (e: MouseEvent) => {
      if (this.mouseThrottleTimer) return;
      this.mouseThrottleTimer = setTimeout(() => {
        this.mouseThrottleTimer = null;
      }, 500);
      if (this.mousePositions.length < 500) {
        this.mousePositions.push({ x: e.clientX, y: e.clientY, t: Date.now() - this.startTime });
      }
    };

    // Click tracking (capped at 200)
    const onClick = (e: MouseEvent) => {
      const now = Date.now();
      if (this.clicks.length < 200) {
        const target = (e.target as HTMLElement)?.tagName?.toLowerCase() || "unknown";
        this.clicks.push({ x: e.clientX, y: e.clientY, target, t: now - this.startTime });
      }

      // Rage click detection (3+ clicks within 500ms in ~30px area)
      if (now - this.lastClickTime < 500 && Math.abs(e.clientX - this.lastClickX) < 30 && Math.abs(e.clientY - this.lastClickY) < 30) {
        this.rapidClickCount++;
        if (this.rapidClickCount >= 3) {
          this.rageClicks++;
          this.rapidClickCount = 0;
        }
      } else {
        this.rapidClickCount = 1;
      }
      this.lastClickTime = now;
      this.lastClickX = e.clientX;
      this.lastClickY = e.clientY;
    };

    // Scroll depth
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const depth = Math.round((scrollTop / docHeight) * 100);
        if (depth > this.scrollDepth) this.scrollDepth = depth;
      }
    };

    // Tab switches
    const onVisibilityChange = () => {
      if (document.hidden) this.tabSwitches++;
    };

    // Paste detection
    const onPaste = (e: ClipboardEvent) => {
      const target = (e.target as HTMLElement);
      const name = target.getAttribute("name") || target.getAttribute("data-field") || target.tagName;
      this.pasteEvents.push(name);
    };

    // Copy detection
    const onCopy = () => { this.copyEvents++; };

    // Right-click detection
    const onContextMenu = () => { this.rightClickEvents++; };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("click", onClick, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("paste", onPaste);
    document.addEventListener("copy", onCopy);
    document.addEventListener("contextmenu", onContextMenu);

    this.cleanupFns.push(
      () => document.removeEventListener("mousemove", onMouseMove),
      () => document.removeEventListener("click", onClick),
      () => window.removeEventListener("scroll", onScroll),
      () => document.removeEventListener("visibilitychange", onVisibilityChange),
      () => document.removeEventListener("paste", onPaste),
      () => document.removeEventListener("copy", onCopy),
      () => document.removeEventListener("contextmenu", onContextMenu),
    );
  }

  onFieldFocus(fieldName: string) {
    this.fieldTimings.push({ fieldName, focusTime: Date.now() - this.startTime });
    if (!this.fieldOrder.includes(fieldName)) {
      this.fieldOrder.push(fieldName);
    }
  }

  onFieldBlur(fieldName: string) {
    const timing = [...this.fieldTimings].reverse().find(
      (t) => t.fieldName === fieldName && !t.blurTime
    );
    if (timing) {
      timing.blurTime = Date.now() - this.startTime;
      timing.duration = timing.blurTime - timing.focusTime;
    }
  }

  onFieldEdit(fieldName: string) {
    this.editCounts[fieldName] = (this.editCounts[fieldName] || 0) + 1;

    // Typing speed calculation
    const now = Date.now();
    if (this.lastKeyTime[fieldName]) {
      const gap = now - this.lastKeyTime[fieldName];
      if (gap > 0 && gap < 2000) {
        if (!this.typingSpeeds[fieldName]) this.typingSpeeds[fieldName] = [];
        if (this.typingSpeeds[fieldName].length < 50) {
          this.typingSpeeds[fieldName].push(gap);
        }
      }
    }
    this.lastKeyTime[fieldName] = now;
  }

  onValidationError() {
    this.validationErrors++;
  }

  getSnapshot(): BehavioralSnapshot {
    return {
      fieldTimings: this.fieldTimings,
      editCounts: this.editCounts,
      fieldOrder: this.fieldOrder,
      pasteEvents: this.pasteEvents,
      typingSpeeds: this.typingSpeeds,
      scrollDepth: this.scrollDepth,
      tabSwitches: this.tabSwitches,
      rageClicks: this.rageClicks,
      copyEvents: this.copyEvents,
      rightClickEvents: this.rightClickEvents,
      validationErrors: this.validationErrors,
      duration: Date.now() - this.startTime,
      pageLoadTime: Math.round(this.pageLoadTime),
      mouseHeatmap: this.mousePositions,
      clickMap: this.clicks,
    };
  }

  destroy() {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
    if (this.mouseThrottleTimer) clearTimeout(this.mouseThrottleTimer);
  }
}
