const BASE_URL = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:8001/demo/v1';

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const { signal: externalSignal, ...restOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }
  try {
    return await fetch(url, { ...restOptions, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchProducts(params = {}, signal) {
  const query = new URLSearchParams();
  if (params.page)                        query.set('page', params.page);
  if (params.size)                        query.set('size', params.size);
  if (params.name)                        query.set('name', params.name);
  if (params.status)                      query.set('status', params.status);
  if (params.productSource)               query.set('product_source', params.productSource);
  if (params.platformStatus)              query.set('platform_status', params.platformStatus);
  if (params.platform_status)             query.set('platform_status', params.platform_status);
  if (params.categoryId)                  query.set('category_id', params.categoryId);
  if (params.category_id)                 query.set('category_id', params.category_id);
  if (params.sku)                         query.set('sku', params.sku);
  if (params.keyword)                     query.set('keyword', params.keyword);
  if (params.sort)                        query.set('sort', params.sort);
  if (params.published != null)           query.set('published', params.published);

  const res = await fetchWithTimeout(`${BASE_URL}/products?${query.toString()}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchProductById(id) {
  const res = await fetchWithTimeout(`${BASE_URL}/products/${id}`);
  if (res.status === 404) return { data: null };
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchCategories(params = {}, signal) {
  const query = new URLSearchParams();
  if (params.page)              query.set('page', params.page);
  if (params.size)              query.set('size', params.size);
  if (params.status)            query.set('status', params.status);
  if (params.keyword)           query.set('keyword', params.keyword);
  if (params.sort)              query.set('sort', params.sort);
  if (params.has_published != null) query.set('has_published', params.has_published);

  const res = await fetchWithTimeout(`${BASE_URL}/categories?${query.toString()}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateProductPlatformStatus(id, platformStatus) {
  const res = await fetchWithTimeout(`${BASE_URL}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform_status: platformStatus }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
