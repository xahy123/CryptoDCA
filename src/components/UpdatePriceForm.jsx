import React, { useState } from 'react';
import { Form, InputNumber, Button, Select, Card, Row, Col, message, Tooltip } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useCrypto } from '../context/CryptoContext';

const { Option } = Select;

const UpdatePriceForm = () => {
  const [form] = Form.useForm();
  const { cryptoList, updatePrice, updatePriceFromApi, loading } = useCrypto();
  const [selectedCrypto, setSelectedCrypto] = useState(null);

  const onFinish = (values) => {
    updatePrice(values.cryptoId, values.price);
    form.resetFields(['price']);
    setSelectedCrypto(null);
  };
  
  const handleCryptoSelect = (cryptoId) => {
    const crypto = cryptoList.find(c => c.id === cryptoId);
    setSelectedCrypto(crypto);
  };
  
  const handleFetchPriceFromApi = async () => {
    console.log('更新前的加密货币数据:', selectedCrypto);
    if (!selectedCrypto) {
      message.warning('请先选择一个加密货币');
      return;
    }
    
    try {
      // 直接传递加密货币ID，updatePriceFromApi会从state中获取address和id
      await updatePriceFromApi(selectedCrypto.id);
      message.success(`已成功更新${selectedCrypto.name}的价格`);
      form.resetFields();
      setSelectedCrypto(null);
    } catch (error) {
      message.error('获取价格失败，请手动输入');
    }
  };

  return (
    <Card title="更新价格" className="update-price-form">
      <Form
        form={form}
        name="update_price"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="选择币种"
              name="cryptoId"
              rules={[{ required: true, message: '请选择币种!' }]}
            >
              <Select placeholder="选择币种" onChange={handleCryptoSelect}>
                {cryptoList.map(crypto => (
                  <Option key={crypto.id} value={crypto.id}>
                    {crypto.symbol} - {crypto.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="当前价格 (USD)"
              name="price"
              rules={[{ required: true, message: '请输入价格!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="当前价格 (USD)"
                addonAfter={
                  <Tooltip title="从API获取价格">
                    <Button 
                      type="text" 
                      icon={<SyncOutlined spin={loading} />} 
                      onClick={handleFetchPriceFromApi}
                      disabled={!selectedCrypto}
                      loading={loading}
                    />
                  </Tooltip>
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            手动更新价格
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UpdatePriceForm;