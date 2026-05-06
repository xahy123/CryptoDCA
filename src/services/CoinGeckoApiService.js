// CoinGecko API 服务

const API_BASE_URL = 'https://api.coingecko.com/api/v3';
const DEFAULT_CURRENCY = 'usd';

const normalizeMarketCoin = (coin) => ({
  id: coin.id,
  coingeckoId: coin.id,
  name: coin.name,
  symbol: coin.symbol?.toUpperCase() || '',
  image: coin.image || coin.large || coin.thumb || '',
  currentPrice: coin.current_price ?? coin.price ?? 0,
  marketCapRank: coin.market_cap_rank ?? null,
});

const normalizeSearchCoin = (coin) => ({
  id: coin.id,
  coingeckoId: coin.id,
  name: coin.name,
  symbol: coin.symbol?.toUpperCase() || '',
  image: coin.large || coin.thumb || '',
  marketCapRank: coin.market_cap_rank ?? null,
});

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CoinGecko API请求失败: ${response.status}`);
  }
  return response.json();
};

/**
 * 获取热门加密货币列表，作为初始选择列表。
 * @returns {Promise<Array>} 标准化后的加密货币列表
 */
export const fetchCryptoCurrencies = async () => {
  const params = new URLSearchParams({
    vs_currency: DEFAULT_CURRENCY,
    order: 'market_cap_desc',
    per_page: '100',
    page: '1',
    sparkline: 'false',
    locale: 'zh',
  });

  const data = await fetchJson(`${API_BASE_URL}/coins/markets?${params}`);
  return data.map(normalizeMarketCoin);
};

/**
 * 通过 CoinGecko ID 获取单个币种价格。
 * @param {string} coingeckoId - CoinGecko 币种ID，例如 bitcoin
 * @returns {Promise<number>} USD价格
 */
export const fetchTokenPrice = async (coingeckoId) => {
  const prices = await fetchTokenPrices([coingeckoId]);
  const price = prices[coingeckoId];
  if (typeof price !== 'number') {
    throw new Error(`CoinGecko未返回 ${coingeckoId} 的价格`);
  }
  return price;
};

/**
 * 批量获取价格，减少更新全部价格时的请求次数。
 * @param {Array<string>} coingeckoIds - CoinGecko ID列表
 * @returns {Promise<Object>} { [coingeckoId]: price }
 */
export const fetchTokenPrices = async (coingeckoIds) => {
  const ids = [...new Set(coingeckoIds.filter(Boolean))];
  if (ids.length === 0) {
    return {};
  }

  const params = new URLSearchParams({
    ids: ids.join(','),
    vs_currencies: DEFAULT_CURRENCY,
  });

  const data = await fetchJson(`${API_BASE_URL}/simple/price?${params}`);
  return Object.fromEntries(
    Object.entries(data).map(([id, value]) => [id, value[DEFAULT_CURRENCY]])
  );
};

/**
 * 搜索 CoinGecko 加密货币。
 * @param {string} query - 搜索关键词
 * @returns {Promise<Array>} 标准化后的搜索结果
 */
export const searchCryptoCurrencies = async (query) => {
  if (!query || query.trim() === '') {
    return fetchCryptoCurrencies();
  }

  const params = new URLSearchParams({ query: query.trim() });
  const data = await fetchJson(`${API_BASE_URL}/search?${params}`);
  return (data.coins || [])
    .slice(0, 50)
    .map(normalizeSearchCoin);
};
