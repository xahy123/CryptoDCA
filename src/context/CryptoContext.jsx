import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import { calculateCryptoStats, addTransaction, createCryptoData } from '../models/CryptoData';
import { fetchCryptoCurrencies, fetchTokenPrice, searchCryptoCurrencies } from '../services/RelayApiService';

// 创建Context
const CryptoContext = createContext();

// 初始状态
const initialState = {
  cryptoList: [],
  loading: false,
  error: null,
  apiTokens: [], // 从API获取的代币列表
  filteredTokens: [], // 过滤后的代币列表
  searchQuery: '', // 搜索关键词
};

// Action类型
const ActionTypes = {
  ADD_CRYPTO: 'ADD_CRYPTO',
  UPDATE_CRYPTO: 'UPDATE_CRYPTO',
  DELETE_CRYPTO: 'DELETE_CRYPTO',
  UPDATE_PRICE: 'UPDATE_PRICE',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_DATA: 'LOAD_DATA',
  SET_API_TOKENS: 'SET_API_TOKENS',
  SET_FILTERED_TOKENS: 'SET_FILTERED_TOKENS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
};

// Reducer函数
function cryptoReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_CRYPTO: {
      const newCrypto = createCryptoData(
        Date.now().toString(),
        action.payload.name,
        action.payload.symbol,
        action.payload.address,
        action.payload.chainId,
        action.payload.isCustom || false,
      );
      console.log('添加的加密货币数据:', newCrypto);
      return {
        ...state,
        cryptoList: [...state.cryptoList, newCrypto],
      };
    }
    
    case ActionTypes.UPDATE_CRYPTO: {
      const updatedList = state.cryptoList.map(crypto =>
        crypto.id === action.payload.id ? action.payload : crypto
      );
      return {
        ...state,
        cryptoList: updatedList,
      };
    }
    
    case ActionTypes.DELETE_CRYPTO: {
      const filteredList = state.cryptoList.filter(
        crypto => crypto.id !== action.payload.id
      );
      return {
        ...state,
        cryptoList: filteredList,
      };
    }
    
    case ActionTypes.UPDATE_PRICE: {
      const updatedList = state.cryptoList.map(crypto => {
        if (crypto.id === action.payload.id) {
          const updatedCrypto = {
            ...crypto,
            currentPrice: action.payload.price,
          };
          return calculateCryptoStats(updatedCrypto);
        }
        return crypto;
      });
      return {
        ...state,
        cryptoList: updatedList,
      };
    }
    
    case ActionTypes.ADD_TRANSACTION: {
      const { cryptoId, price, amount } = action.payload;
      const updatedList = state.cryptoList.map(crypto => {
        if (crypto.id === cryptoId) {
          return addTransaction(crypto, price, amount);
        }
        return crypto;
      });
      return {
        ...state,
        cryptoList: updatedList,
      };
    }
    
    case ActionTypes.SET_LOADING: {
      return {
        ...state,
        loading: action.payload,
      };
    }
    
    case ActionTypes.SET_ERROR: {
      return {
        ...state,
        error: action.payload,
      };
    }
    
    case ActionTypes.LOAD_DATA: {
      return {
        ...state,
        cryptoList: action.payload,
      };
    }
    
    case ActionTypes.SET_API_TOKENS: {
      return {
        ...state,
        apiTokens: action.payload,
        filteredTokens: action.payload,
      };
    }
    
    case ActionTypes.SET_FILTERED_TOKENS: {
      return {
        ...state,
        filteredTokens: action.payload,
      };
    }
    
    case ActionTypes.SET_SEARCH_QUERY: {
      return {
        ...state,
        searchQuery: action.payload,
      };
    }
    
    default:
      return state;
  }
}

// Provider组件
export function CryptoProvider({ children }) {
  const [state, dispatch] = useReducer(cryptoReducer, initialState);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const hasAutoUpdatedRef = useRef(false); // 标记是否已经执行过自动更新
  
  // 从本地存储加载数据
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem('cryptoDcaData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          dispatch({ type: ActionTypes.LOAD_DATA, payload: parsedData });
        }
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    };
    
    loadData();
  }, []);
  
  // 从API加载代币列表
  useEffect(() => {
    const loadApiTokens = async () => {
      setIsLoadingTokens(true);
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      try {
        const tokens = await fetchCryptoCurrencies();
        // 数组对象去重，如果所有属性相等
        const uniqueTokens = tokens.filter((token, index, self) =>
          index === self.findIndex(t => 
            t.id === token.id &&
            t.name === token.name &&
            t.symbol === token.symbol &&
            t.address === token.address &&
            t.chainId === token.chainId
          )
        );
        dispatch({ type: ActionTypes.SET_API_TOKENS, payload: uniqueTokens });
      } catch (error) {
        console.error('Failed to load tokens from API:', error);
        dispatch({ 
          type: ActionTypes.SET_ERROR, 
          payload: '无法从API加载代币列表' 
        });
      } finally {
        setIsLoadingTokens(false);
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    };
    
    loadApiTokens();
  }, []);
  
  // 保存数据到本地存储
  useEffect(() => {
    if (state.cryptoList.length > 0) {
      localStorage.setItem('cryptoDcaData', JSON.stringify(state.cryptoList));
    }
  }, [state.cryptoList]);

  // 提供给组件使用的方法
  const addCrypto = (name, symbol, address = '', chainId = '', isCustom = false) => {
    console.log('添加的加密货币数据:', name, symbol, address, chainId, isCustom);
    dispatch({ type: ActionTypes.ADD_CRYPTO, payload: { name, symbol, address, chainId, isCustom } });
  };
  
  const updateCrypto = (crypto) => {
    dispatch({ type: ActionTypes.UPDATE_CRYPTO, payload: crypto });
  };
  
  const deleteCrypto = (id) => {
    dispatch({ type: ActionTypes.DELETE_CRYPTO, payload: { id } });
  };
  
  const updatePrice = (id, price) => {
    dispatch({ type: ActionTypes.UPDATE_PRICE, payload: { id, price } });
  };
  
  const addCryptoTransaction = async (cryptoId, amount, cost) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const crypto = state.cryptoList.find(c => c.id === cryptoId);
      if (!crypto) {
        throw new Error('找不到加密货币');
      }
      
      // 根据花费金额和数量计算价格
      const price = cost / amount;
      
      dispatch({
        type: ActionTypes.ADD_TRANSACTION,
        payload: { cryptoId, price, amount },
      });
    } catch (error) {
      console.error('Failed to add transaction:', error);
      dispatch({ 
        type: ActionTypes.SET_ERROR, 
        payload: `添加交易失败: ${error.message}` 
      });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };
  
  // 搜索代币
  const searchTokens = (query) => {
    dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: query });
    const filtered = searchCryptoCurrencies(state.apiTokens, query);
    dispatch({ type: ActionTypes.SET_FILTERED_TOKENS, payload: filtered });
  };
  
  // 从API获取代币价格并更新
  const updatePriceFromApi = async (cryptoId) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const crypto = state.cryptoList.find(c => c.id === cryptoId);
      if (!crypto || !crypto.address) {
        throw new Error('找不到加密货币或地址信息');
      }
      console.log('更新前的加密货币数据:', crypto);
      const price = await fetchTokenPrice(crypto.address, crypto.chainId);
      updatePrice(cryptoId, price);
    } catch (error) {
      console.error('Failed to update price from API:', error);
      dispatch({ 
        type: ActionTypes.SET_ERROR, 
        payload: `无法获取代币价格` 
      });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };
  
  // 批量更新所有代币价格
  const updateAllPricesFromApi = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const cryptosWithAddress = state.cryptoList.filter(crypto => crypto.address);
      
      if (cryptosWithAddress.length === 0) {
        dispatch({ 
          type: ActionTypes.SET_ERROR, 
          payload: '没有可更新价格的代币（缺少地址信息）' 
        });
        return;
      }
      
      // 并发获取所有代币价格
      const pricePromises = cryptosWithAddress.map(async (crypto) => {
        try {
          const price = await fetchTokenPrice(crypto.address, crypto.chainId);
          return { id: crypto.id, price };
        } catch (error) {
          console.error(`Failed to update price for ${crypto.symbol}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(pricePromises);
      const successfulUpdates = results.filter(result => result !== null);
      
      // 批量更新价格
      successfulUpdates.forEach(({ id, price }) => {
        updatePrice(id, price);
      });
      
      if (successfulUpdates.length < cryptosWithAddress.length) {
        dispatch({ 
          type: ActionTypes.SET_ERROR, 
          payload: `部分代币价格更新失败，成功更新 ${successfulUpdates.length}/${cryptosWithAddress.length} 个代币` 
        });
      }
    } catch (error) {
      console.error('Failed to update all prices:', error);
      dispatch({ 
        type: ActionTypes.SET_ERROR, 
        payload: '批量更新价格失败' 
      });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // 自动更新所有代币价格（网站打开或刷新时）
  useEffect(() => {
    // 当cryptoList有数据且未执行过自动更新时执行
    if (!hasAutoUpdatedRef.current && state.cryptoList.length > 0) {
      const cryptosWithAddress = state.cryptoList.filter(crypto => crypto.address);
      if (cryptosWithAddress.length > 0) {
        console.log('自动更新所有代币价格...');
        hasAutoUpdatedRef.current = true; // 标记已执行
        updateAllPricesFromApi();
      }
    }
  }, [state.cryptoList]); // 依赖cryptoList变化
  
  // 页面关闭时提示备份数据
  useEffect(() => {
    let userInteracted = false;
    
    // 检测用户交互
    const markUserInteraction = () => {
      userInteracted = true;
      console.log('用户已与页面交互，beforeunload提示已激活');
    };
    
    const handleBeforeUnload = (event) => {
      console.log('beforeunload事件触发', {
        cryptoListLength: state.cryptoList.length,
        userInteracted
      });
      
      // 只有当有数据且用户已交互时才提示
      if (state.cryptoList.length > 0 && userInteracted) {
        const message = '您有重要的加密货币数据，建议在离开前导出备份。确定要离开吗？';
        event.preventDefault();
        event.returnValue = message; // 标准方式
        return message; // 兼容某些浏览器
      }
    };
    
    // 添加用户交互监听器
    const interactionEvents = ['click', 'keydown', 'scroll', 'touchstart'];
    interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, markUserInteraction, { once: true });
    });
    
    // 添加beforeunload事件监听器
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 清理函数
    return () => {
      interactionEvents.forEach(eventType => {
        document.removeEventListener(eventType, markUserInteraction);
      });
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.cryptoList.length]); // 依赖数据数量变化
  
  // 导出数据为JSON文件
  const exportData = () => {
    try {
      const dataToExport = {
        cryptoList: state.cryptoList,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `crypto-dca-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(link.href);
      console.log('数据导出成功');
    } catch (error) {
      console.error('导出数据失败:', error);
      dispatch({ 
        type: ActionTypes.SET_ERROR, 
        payload: '导出数据失败' 
      });
    }
  };
  
  // 导入数据从JSON文件
  const importData = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('请选择文件'));
        return;
      }
      
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        reject(new Error('请选择JSON格式的文件'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          
          // 验证数据格式
          if (!importedData.cryptoList || !Array.isArray(importedData.cryptoList)) {
            reject(new Error('无效的数据格式：缺少cryptoList数组'));
            return;
          }
          
          // 验证每个crypto对象的基本结构
          const isValidCryptoList = importedData.cryptoList.every(crypto => 
            crypto.id && crypto.name && crypto.symbol && 
            typeof crypto.transactions === 'object' && 
            Array.isArray(crypto.transactions)
          );
          
          if (!isValidCryptoList) {
            reject(new Error('无效的数据格式：crypto对象结构不正确'));
            return;
          }
          
          // 导入数据
          dispatch({ type: ActionTypes.LOAD_DATA, payload: importedData.cryptoList });
          console.log('数据导入成功，共导入', importedData.cryptoList.length, '个加密货币');
          resolve(importedData.cryptoList.length);
        } catch (error) {
          console.error('解析JSON文件失败:', error);
          reject(new Error('文件格式错误，无法解析JSON'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsText(file);
    });
  };
  
  const value = {
    cryptoList: state.cryptoList,
    loading: state.loading || isLoadingTokens,
    error: state.error,
    apiTokens: state.apiTokens,
    filteredTokens: state.filteredTokens,
    searchQuery: state.searchQuery,
    addCrypto,
    updateCrypto,
    deleteCrypto,
    updatePrice,
    updatePriceFromApi,
    updateAllPricesFromApi,
    addCryptoTransaction,
    searchTokens,
    exportData,
    importData,
  };
  
  return (
    <CryptoContext.Provider value={value}>
      {children}
    </CryptoContext.Provider>
  );
}

// 自定义Hook，方便组件使用Context
export function useCrypto() {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
}