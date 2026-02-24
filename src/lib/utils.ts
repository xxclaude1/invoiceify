import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function generateDocumentNumber(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  technology: ["software", "website", "app", "development", "coding", "programming", "api", "saas", "cloud", "server", "hosting", "database", "it support", "tech"],
  design: ["design", "logo", "branding", "ui", "ux", "graphic", "illustration", "creative", "mockup", "wireframe", "photoshop"],
  consulting: ["consulting", "advisory", "strategy", "analysis", "assessment", "audit", "review", "recommendation"],
  marketing: ["marketing", "seo", "advertising", "campaign", "social media", "content", "copywriting", "email marketing", "ppc", "analytics"],
  construction: ["construction", "building", "renovation", "plumbing", "electrical", "roofing", "painting", "carpentry", "flooring", "demolition"],
  healthcare: ["medical", "health", "therapy", "treatment", "consultation", "diagnosis", "prescription", "dental", "nursing", "clinical"],
  legal: ["legal", "attorney", "lawyer", "contract", "litigation", "compliance", "trademark", "patent", "arbitration"],
  education: ["training", "course", "workshop", "tutoring", "education", "coaching", "lesson", "curriculum", "mentoring"],
  food: ["catering", "food", "restaurant", "meal", "beverage", "cooking", "bakery", "delivery"],
  photography: ["photography", "photo", "videography", "video", "shooting", "editing", "portrait", "wedding photo"],
  automotive: ["automotive", "car", "vehicle", "repair", "maintenance", "oil change", "tire", "brake", "engine"],
  real_estate: ["real estate", "property", "rental", "lease", "mortgage", "inspection", "appraisal", "staging"],
};

export function detectIndustry(lineItemDescriptions: string[]): string | null {
  const text = lineItemDescriptions.join(" ").toLowerCase();
  let bestMatch: string | null = null;
  let bestCount = 0;

  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    let count = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) count++;
    }
    if (count > bestCount) {
      bestCount = count;
      bestMatch = industry;
    }
  }

  return bestCount >= 1 ? bestMatch : null;
}

export function categorizeRevenue(grandTotal: number): string {
  if (grandTotal < 1000) return "<1k";
  if (grandTotal < 5000) return "1k-5k";
  if (grandTotal < 25000) return "5k-25k";
  if (grandTotal < 100000) return "25k-100k";
  return "100k+";
}

export function extractEmailDomain(email: string | null | undefined): string | null {
  if (!email || !email.includes("@")) return null;
  return email.split("@")[1].toLowerCase();
}
