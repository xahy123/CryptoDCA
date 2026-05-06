import React from 'react';
import { Button, Form, InputNumber, Select, Typography } from 'antd';
import { useCrypto } from '../context/CryptoContext';

const { Option } = Select;
const { Text } = Typography;

const AddTransactionForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { cryptoList, addCryptoTransaction } = useCrypto();
  const selectedCryptoId = Form.useWatch('cryptoId', form);
  const selectedCrypto = cryptoList.find(crypto => crypto.id === selectedCryptoId);

  const onFinish = async (values) => {
    try {
      await addCryptoTransaction(
        values.cryptoId,
        values.amount,
        values.cost
      );
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('添加交易失败:', error);
    }
  };

  return (
    <div className="add-transaction-form">
      <Form
        form={form}
        name="add_transaction"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="选择币种"
          name="cryptoId"
          rules={[{ required: true, message: '请选择币种!' }]}
        >
          <Select placeholder="选择币种" optionLabelProp="label">
            {cryptoList.map(crypto => (
              <Option key={crypto.id} value={crypto.id} label={`${crypto.symbol} - ${crypto.name}`}>
                <div className="asset-option">
                  {crypto.image && <img src={crypto.image} alt="" className="asset-icon small" />}
                  <span>{crypto.symbol} - {crypto.name}</span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedCrypto && (
          <div className="transaction-hint">
            <Text type="secondary">
              当前参考价：${selectedCrypto.currentPrice >= 1
                ? selectedCrypto.currentPrice.toFixed(2)
                : selectedCrypto.currentPrice.toFixed(6)}
            </Text>
          </div>
        )}

        <Form.Item
          label="数量"
          name="amount"
          rules={[
            { required: true, message: '请输入交易数量!' },
            {
              validator: (_, value) => (
                value > 0 ? Promise.resolve() : Promise.reject(new Error('交易数量必须大于0!'))
              ),
            },
          ]}
        >
          <InputNumber
            placeholder="购买数量"
            min={0.00000001}
            step={0.01}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="花费金额"
          name="cost"
          rules={[
            { required: true, message: '请输入花费金额!' },
            {
              validator: (_, value) => (
                value >= 0 ? Promise.resolve() : Promise.reject(new Error('花费金额不能小于0!'))
              ),
            },
          ]}
        >
          <InputNumber
            placeholder="花费金额"
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            addonBefore="$"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            添加交易
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddTransactionForm;
