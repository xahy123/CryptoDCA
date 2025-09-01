// 加密货币数据模型

// 加密货币状态枚举
export const CryptoStatus = {
  PROFIT: 'profit',  // 盈利
  LOSS: 'loss',      // 亏损
  NEUTRAL: 'neutral' // 持平
};

// 创建一个加密货币数据的默认结构
export const createCryptoData = (id, name, symbol, address = '', chainId = '', isCustom = false) => ({
  id,                // 唯一标识符
  chainId,           // 链ID
  name,              // 币种名称
  symbol,            // 币种符号
  address,           // 代币合约地址
  isCustom,          // 是否为自定义代币（手动添加）
  currentPrice: 0,   // 当前价格
  averageCost: 0,    // 平均成本
  holdingAmount: 0,  // 持有数量
  investmentAmount: 0, // 投入金额
  currentValue: 0,   // 当前价值
  profit: 0,         // 利润/亏损
  profitRate: 0,     // 收益率
  status: CryptoStatus.NEUTRAL, // 状态
  transactions: [],  // 交易记录
});

// 计算加密货币的统计数据
export const calculateCryptoStats = (crypto) => {
  // 计算当前价值
  const currentValue = crypto.currentPrice * crypto.holdingAmount;
  
  // 计算利润/亏损
  const profit = currentValue - crypto.investmentAmount;
  
  // 计算收益率
  const profitRate = crypto.investmentAmount > 0 
    ? (profit / crypto.investmentAmount) * 100 
    : 0;
  
  // 确定状态
  let status = CryptoStatus.NEUTRAL;
  if (profitRate > 0) {
    status = CryptoStatus.PROFIT;
  } else if (profitRate < 0) {
    status = CryptoStatus.LOSS;
  }
  
  return {
    ...crypto,
    currentValue,
    profit,
    profitRate,
    status
  };
};

// 添加交易记录并更新统计数据
export const addTransaction = (crypto, price, amount, date = new Date()) => {
  const transaction = {
    id: Date.now().toString(),
    price,
    amount,
    date,
    total: price * amount
  };
  
  // 添加新交易到交易记录
  const updatedTransactions = [...crypto.transactions, transaction];
  
  // 计算新的投入金额
  const newInvestmentAmount = crypto.investmentAmount + transaction.total;
  
  // 计算新的持有数量
  const newHoldingAmount = crypto.holdingAmount + amount;
  
  // 计算新的平均成本
  const newAverageCost = newHoldingAmount > 0 
    ? newInvestmentAmount / newHoldingAmount 
    : 0;
  
  // 更新加密货币数据
  const updatedCrypto = {
    ...crypto,
    averageCost: newAverageCost,
    holdingAmount: newHoldingAmount,
    investmentAmount: newInvestmentAmount,
    transactions: updatedTransactions
  };
  
  // 重新计算统计数据
  return calculateCryptoStats(updatedCrypto);
};