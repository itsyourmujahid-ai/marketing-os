import type {
  BrandIdentity,
  BrandVoice,
  BusinessGoal,
  BusinessProfile,
  MarketingGoal,
  ProductOrService,
  TargetMarket,
  ValueProposition,
} from "./types";

export type FieldErrors = Record<string, string>;

export const MAX_IMAGE_BYTES = 1_000_000; // 1 MB per logo/favicon
export const MAX_ASSET_BYTES = 2_000_000; // 2 MB per brand asset

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(:\d+)?(\/[^\s]*)?$/i;
const NUMERIC_RE = /^\d*\.?\d+$/;
const COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const ALLOWED_IMAGE_MIME = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const ALLOWED_DOC_MIME = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_GENERIC_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "text/plain",
  "application/pdf",
];

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function validateEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function validateUrl(value: string): boolean {
  if (!value.trim()) return true;
  return URL_RE.test(value.trim());
}

export function validateNumeric(value: string): boolean {
  if (!value.trim()) return true;
  return NUMERIC_RE.test(value.trim());
}

export function validateColor(value: string): boolean {
  if (!value.trim()) return true;
  return COLOR_RE.test(value.trim());
}

export function validateDate(value: string): boolean {
  if (!value.trim()) return true;
  return DATE_RE.test(value.trim());
}

export function validateImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_MIME.includes(mimeType);
}

export function validateAssetType(mimeType: string): boolean {
  return ALLOWED_GENERIC_MIME.includes(mimeType) || ALLOWED_DOC_MIME.includes(mimeType);
}

export function validateFile(file: File, maxBytes: number): { ok: boolean; error?: string } {
  if (!ALLOWED_GENERIC_MIME.includes(file.type)) {
    return { ok: false, error: "Unsupported file type. Use PNG, JPEG, WebP, SVG, PDF or TXT." };
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / 1024 / 1024 * 10) / 10;
    return { ok: false, error: `File is too large. Maximum size is ${mb} MB.` };
  }
  return { ok: true };
}

interface ValidatorResult {
  errors: FieldErrors;
  valid: boolean;
}

export function validateProfile(p: BusinessProfile): ValidatorResult {
  const errors: FieldErrors = {};
  if (!isRequired(p.businessName)) errors.businessName = "Business name is required";
  if (!isRequired(p.industry)) errors.industry = "Industry is required";
  if (!isRequired(p.businessType)) errors.businessType = "Business type is required";
  if (!isRequired(p.country)) errors.country = "Country is required";
  if (p.website && !validateUrl(p.website)) errors.website = "Enter a valid website URL";
  if (p.businessEmail && !validateEmail(p.businessEmail))
    errors.businessEmail = "Enter a valid email address";
  if (p.businessPhone && p.businessPhone.trim().length < 5)
    errors.businessPhone = "Phone number is too short";
  return { errors, valid: Object.keys(errors).length === 0 };
}

export function validateValueProposition(vp: ValueProposition): ValidatorResult {
  const errors: FieldErrors = {};
  if (!isRequired(vp.mainValue)) errors.mainValue = "Main value proposition is required";
  if (!isRequired(vp.usp)) errors.usp = "Unique selling proposition is required";
  if (!isRequired(vp.problemSolved)) errors.problemSolved = "Main customer problem is required";
  if (!isRequired(vp.solutionProvided))
    errors.solutionProvided = "Main solution provided is required";
  return { errors, valid: Object.keys(errors).length === 0 };
}

export function validateProduct(p: ProductOrService): ValidatorResult {
  const errors: FieldErrors = {};
  if (!isRequired(p.name)) errors.name = "Name is required";
  if (!isRequired(p.kind)) errors.kind = "Type is required";
  if (p.price && !validateNumeric(p.price)) errors.price = "Price must be a number";
  if (!isRequired(p.status)) errors.status = "Status is required";
  return { errors, valid: Object.keys(errors).length === 0 };
}

export function validateTargetMarket(tm: TargetMarket): ValidatorResult {
  const errors: FieldErrors = {};
  if (!isRequired(tm.customerType)) errors.customerType = "Customer type is required";
  if (tm.ageRange && !/\d/.test(tm.ageRange)) errors.ageRange = "Age range should contain numbers (e.g. 25-44)";
  return { errors, valid: Object.keys(errors).length === 0 };
}

export function validateBusinessGoal(g: BusinessGoal): ValidatorResult {
  const errors: FieldErrors = {};
  if (!isRequired(g.name)) errors.name = "Goal name is required";
  if (g.targetValue && !validateNumeric(g.targetValue))
    errors.targetValue = "Target value must be a number";
  if (g.currentValue && !validateNumeric(g.currentValue))
    errors.currentValue = "Current value must be a number";
  if (g.deadline && !validateDate(g.deadline))
    errors.deadline = "Use the date picker (YYYY-MM-DD)";
  return { errors, valid: Object.keys(errors).length === 0 };
}

export function validateMarketingGoal(mg: MarketingGoal): ValidatorResult {
  const errors: FieldErrors = {};
  const numericFields: Array<[string, string]> = [
    ["monthlyLeadTarget", mg.monthlyLeadTarget],
    ["monthlyRevenueTarget", mg.monthlyRevenueTarget],
    ["marketingBudget", mg.marketingBudget],
    ["targetConversionRate", mg.targetConversionRate],
  ];
  for (const [name, value] of numericFields) {
    if (value && !validateNumeric(value)) {
      errors[name] = "Must be a number";
    }
  }
  return { errors, valid: Object.keys(errors).length === 0 };
}

export function validateBrandVoice(bv: BrandVoice): ValidatorResult {
  const errors: FieldErrors = {};
  if (bv.tones.length === 0) errors.tones = "Select at least one tone";
  if (!isRequired(bv.personality)) errors.personality = "Brand personality is required";
  return { errors, valid: Object.keys(errors).length === 0 };
}

export function validateBrandIdentity(bi: BrandIdentity): ValidatorResult {
  const errors: FieldErrors = {};
  if (bi.primaryColor && !validateColor(bi.primaryColor))
    errors.primaryColor = "Use a hex color like #F59E0B";
  if (bi.secondaryColor && !validateColor(bi.secondaryColor))
    errors.secondaryColor = "Use a hex color like #3B82F6";
  if (bi.accentColor && !validateColor(bi.accentColor))
    errors.accentColor = "Use a hex color like #A855F7";
  if (bi.backgroundColor && !validateColor(bi.backgroundColor))
    errors.backgroundColor = "Use a hex color like #070910";
  return { errors, valid: Object.keys(errors).length === 0 };
}