import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, Spin, Empty } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useCrypto } from '../context/CryptoContext';

const { Option } = Select;

const AddCryptoForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { addCrypto, filteredTokens, loading, searchTokens, searchQuery } = useCrypto();
  const [selectedToken, setSelectedToken] = useState(null);

  const onFinish = (values) => {
    if (selectedToken) {
      addCrypto(selectedToken.name, selectedToken.symbol, selectedToken.address, selectedToken.chainId);
    } else {
      addCrypto(values.name, values.symbol, values.address || '', values.chainId || '');
    }
    form.resetFields();
    setSelectedToken(null);
    if (onSuccess) {
      onSuccess();
    }
  };
  
  const handleSearch = (value) => {
    searchTokens(value);
  };
  
  const handleTokenSelect = (tokenId) => {
    console.log('选择的代币ID:', tokenId, filteredTokens);
    const token = filteredTokens.find(t => t.id === tokenId);
    if (token) {
      setSelectedToken(token);
      form.setFieldsValue({
        name: token.name,
        symbol: token.symbol,
        address: token.address
      });
    }
  };

  return (
    <div className="add-crypto-form">
      <Form
        form={form}
        name="add_crypto"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="从API选择币种"
          name="tokenId"
        >
          <Select
            showSearch
            placeholder="搜索币种..."
            loading={loading}
            onSearch={handleSearch}
            onChange={handleTokenSelect}
            notFoundContent={loading ? <Spin size="small" /> : <Empty description="无匹配币种" />}
            filterOption={false}
            style={{ width: '100%' }}
            value={selectedToken?.id}
          >
            {filteredTokens.map((token, index) => (
              <Option key={index} value={token.id}>
                {token.name} ({token.symbol})
                {token.chainDisplayName && ` - ${token.chainDisplayName}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          label="币种名称"
          name="name"
          rules={[{ required: true, message: '请输入币种名称!' }]}
        >
          <Input 
            placeholder="例如: Bitcoin" 
            disabled
          />
        </Form.Item>

        <Form.Item
          label="币种符号"
          name="symbol"
          rules={[{ required: true, message: '请输入币种符号!' }]}
        >
          <Input 
            placeholder="例如: BTC" 
            disabled
          />
        </Form.Item>
        
        <Form.Item
          label="代币合约地址"
          name="address"
        >
          <Input 
            placeholder="例如: 0x1234...abcd" 
            disabled
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block>
            添加
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddCryptoForm;