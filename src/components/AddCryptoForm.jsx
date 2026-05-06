import React, { useState } from 'react';
import { Form, Button, Select, Spin, Empty, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCrypto } from '../context/CryptoContext';

const { Option } = Select;
const { Text } = Typography;

const getTokenOptionValue = (token) => token.coingeckoId || token.id;

const AddCryptoForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { addCrypto, filteredTokens, loading, searchTokens } = useCrypto();
  const [selectedToken, setSelectedToken] = useState(null);

  const onFinish = async () => {
    if (!selectedToken) {
      return;
    }

    await addCrypto(selectedToken.name, selectedToken.symbol, {
      coingeckoId: selectedToken.coingeckoId,
      image: selectedToken.image,
      marketCapRank: selectedToken.marketCapRank,
      currentPrice: selectedToken.currentPrice,
    });

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
    const token = filteredTokens.find(t => getTokenOptionValue(t) === tokenId);
    if (token) {
      setSelectedToken(token);
      form.setFieldsValue({
        tokenId: getTokenOptionValue(token)
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
          label="从CoinGecko选择币种"
          name="tokenId"
          rules={[{ required: true, message: '请输入币种名称!' }]}
        >
          <Select
            showSearch
            placeholder="搜索 Bitcoin、ETH、Solana..."
            loading={loading}
            onSearch={handleSearch}
            onChange={handleTokenSelect}
            notFoundContent={loading ? <Spin size="small" /> : <Empty description="无匹配币种" />}
            filterOption={false}
            style={{ width: '100%' }}
            value={selectedToken ? getTokenOptionValue(selectedToken) : undefined}
            optionLabelProp="label"
          >
            {filteredTokens.map((token) => (
              <Option
                key={getTokenOptionValue(token)}
                value={getTokenOptionValue(token)}
                label={`${token.name} (${token.symbol})`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {token.image && (
                    <img src={token.image} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                  )}
                  <span>{token.name} ({token.symbol})</span>
                  {token.marketCapRank && (
                    <Text type="secondary" style={{ marginLeft: 'auto' }}>
                      #{token.marketCapRank}
                    </Text>
                  )}
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        {selectedToken && (
          <div className="selected-asset">
            {selectedToken.image && (
              <img src={selectedToken.image} alt="" className="asset-icon" />
            )}
            <div>
              <strong>{selectedToken.name} ({selectedToken.symbol})</strong>
              <Text type="secondary">CoinGecko ID: {selectedToken.coingeckoId}</Text>
            </div>
          </div>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block disabled={!selectedToken}>
            添加
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddCryptoForm;
