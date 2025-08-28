// Relay API 服务

// API基础URL
const API_BASE_URL = 'https://api.relay.link';

/**
 * 获取所有链上的加密货币列表
 * @returns {Promise<Array>} 加密货币列表
 */
export const fetchCryptoCurrencies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/chains`);
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 提取所有链上的代币信息
    let allTokens = [];
    
    if (data && data.chains && data.chains.length > 0) {
      // 处理每条链上的solverCurrencies
      data.chains.forEach(chain => {
        // 添加链的gas代币
        if (chain.currency) {
          allTokens.push({
            ...chain.currency,
            chainId: chain.id,
            chainName: chain.name,
            chainDisplayName: chain.displayName
          });
        }
        
        // 添加链上的所有代币
        if (chain.solverCurrencies && chain.solverCurrencies.length > 0) {
          const tokensWithChainInfo = chain.solverCurrencies.map(token => ({
            ...token,
            chainId: chain.id,
            chainName: chain.name,
            chainDisplayName: chain.displayName
          }));
          allTokens = [...allTokens, ...tokensWithChainInfo];
        }
      });
    }
    
    return allTokens;
  } catch (error) {
    console.error('获取加密货币列表失败:', error);
    throw error;
  }
};

/**
 * 获取特定代币的价格
 * @param {string} address - 代币合约地址
 * @param {string} chainId - 链ID
 * @returns {Promise<number>} 代币价格
 */
export const fetchTokenPrice = async (address, chainId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/currencies/token/price?address=${address}&chainId=${chainId}`);
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.price;
  } catch (error) {
    console.error(`获取代币价格失败 (address: ${address}, chainId: ${chainId}):`, error);
    throw error;
  }
};

/**
 * 搜索加密货币
 * @param {Array} tokens - 代币列表
 * @param {string} query - 搜索关键词
 * @returns {Array} 过滤后的代币列表
 */
export const searchCryptoCurrencies = (tokens, query) => {
  if (!query || query.trim() === '') {
    return tokens;
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return tokens.filter(token => 
    token.name.toLowerCase().includes(normalizedQuery) ||
    token.symbol.toLowerCase().includes(normalizedQuery)
  );
};