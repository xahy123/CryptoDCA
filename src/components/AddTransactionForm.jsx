import React from 'react';
import { Form, InputNumber, Button, DatePicker, Select, Card } from 'antd';
import { useCrypto } from '../context/CryptoContext';

const { Option } = Select;

const AddTransactionForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { cryptoList, addCryptoTransaction } = useCrypto();

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
          <Select placeholder="选择币种">
            {cryptoList.map(crypto => (
              <Option key={crypto.id} value={crypto.id}>
                {crypto.symbol} - {crypto.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="数量"
          name="amount"
          rules={[{ required: true, message: '请输入交易数量!' }]}
        >
          <InputNumber
            placeholder="购买数量"
            min={0}
            step={0.01}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="花费金额"
          name="cost"
          rules={[{ required: true, message: '请输入花费金额!' }]}
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