import React, { useState } from 'react';
import { Table, Input, Card, Button, Spin, Empty, message, Alert } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useCrypto } from '../context/CryptoContext';
import { fetchCryptoCurrencies } from '../services/RelayApiService';

const ApiTokenList = () => {
  const { filteredTokens, searchTokens, loading, error, addCrypto, dispatch } = useCrypto();
  const [searchValue, setSearchValue] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    searchTokens(value);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const tokens = await fetchCryptoCurrencies();
      dispatch({ type: 'SET_API_TOKENS', payload: tokens });
      message.success('代币列表已刷新');
    } catch (err) {
      message.error('刷新代币列表失败');
      dispatch({ 
        type: 'SET_ERROR', 
        payload: '无法从API加载代币列表' 
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleAddCrypto = (token) => {
    addCrypto(token.name, token.symbol);
    message.success(`已添加 ${token.name} (${token.symbol}) 到您的投资组合`);
  };
  
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span>
          {text} ({record.symbol})
        </span>
      ),
    },
    {
      title: '链',
      dataIndex: 'chainDisplayName',
      key: 'chainDisplayName',
      render: (text) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="small"
          onClick={() => handleAddCrypto(record)}
        >
          添加
        </Button>
      ),
    },
  ];

  return (
    <Card 
      title="API代币列表" 
      className="api-token-list"
      extra={
        <Button 
          icon={<ReloadOutlined spin={refreshing} />} 
          onClick={handleRefresh}
          loading={refreshing}
        >
          刷新
        </Button>
      }
    >
      <Input
        placeholder="搜索代币..."
        prefix={<SearchOutlined />}
        value={searchValue}
        onChange={handleSearch}
        style={{ marginBottom: 16 }}
        allowClear
      />
      
      {error && (
        <Alert 
          message="加载错误" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }}
          closable
        />
      )}
      
      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="加载中..." />
        </div>
      ) : filteredTokens.length > 0 ? (
        <Table 
          dataSource={filteredTokens} 
          columns={columns} 
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="small"
        />
      ) : (
        <Empty description="没有找到匹配的代币" />
      )}
    </Card>
  );
};

export default ApiTokenList;