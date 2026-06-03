import { INDUSTRY_IDS, INDUSTRY_LABELS } from '../constants/industries.js';

const COMPANY_API_URL = import.meta.env.VITE_CATALOG_API_URL || (import.meta.env.PROD ? '/demo/v1' : 'http://localhost:8001/demo/v1');

const mapApiResponse = (data) => {
  if (!data) return null;

  const industryKey = INDUSTRY_IDS[data.company_industry_id] ?? 'other';

  return {
    // ── Identity ──────────────────────────────────────────────────
    id: data.id,
    businessName: data.company_official_name || data.company_name,
    legalName: data.company_official_name || data.company_name,
    brandName: data.company_name,
    uid: data.company_uid,
    slug: data.company_slug,

    // ── Contact ───────────────────────────────────────────────────
    address: data.company_address,
    city: data.company_city,
    province: data.company_province,
    district: data.company_district || '',
    region: data.company_village || '',
    rt: data.company_rt || '',
    rw: data.company_rw || '',
    provinceEn: data.company_province,
    country: data.company_country,
    countryEn: data.company_country,
    postalCode: data.company_zipcode,
    email: data.company_email_contact,
    phone: data.company_phone,
    whatsapp: data.company_whatsapp,
    lat: data.company_lat,
    long: data.company_long,

    // ── Tax ───────────────────────────────────────────────────────
    businessNpwp: data.company_tax_number,
    personalNpwp: data.company_tax_number, // TODO engineer: split into separate API fields when Labamu Core exposes them separately

    // ── Classifications ──────────────────────────────────────────
    entity: data.business_entity_name_en || 'pt',

    type: data.company_product_types_name_id || 'both',

    industryId: data.company_industry_id,
    industry: industryKey,
    industryLabelKey: INDUSTRY_LABELS[industryKey] ?? '',
    industryLabelEn: data.company_industry_name_en,
    industryLabel: data.company_industry_name_id,

    activity: data.business_activity || 'offline',

    membership: data.membership || 'pro',
    logoUrl: data.logo_url || '/assets/teakworks-logo.png',
    syncedAt: data.synced_at,
  };
};

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function getCompanyInfo() {
  const res = await fetchWithTimeout(`${COMPANY_API_URL}/company`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return mapApiResponse(json.data);
}

export async function syncCompanyInfo() {
  const res = await fetchWithTimeout(`${COMPANY_API_URL}/company/sync`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return mapApiResponse(json.data);
}
