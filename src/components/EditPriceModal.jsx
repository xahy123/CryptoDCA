import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Button, message } from 'antd';
import { useCrypto } from '../context/CryptoContext';

const EditPriceModal = ({ visible, onCancel, crypto }) => {
  const [form] = Form.useForm();
  const { updatePrice } = useCrypto();
  const [loading, setLoading] = useState(false);

  // 当模态框打开时，设置当前价格为默认值
  useEffect(() => {
    if (visible && crypto) {
      form.setFieldsValue({
        price: crypto.currentPrice || 0
      });
    }
  }, [visible, crypto, form]);

  const handleSubmit = async (values) => {
    if (!crypto) return;
    
    setLoading(true);
    try {
      updatePrice(crypto.id, values.price);
      message.success(`已更新 ${crypto.name} 的价格`);
      onCancel(); // 关闭模态框
      form.resetFields();
    } catch (error) {
      message.error('更新价格失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={`编辑 ${crypto?.name || ''} 的价格`}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="当前价格 (USD)"
          name="price"
          rules={[
            { required: true, message: '请输入价格!' },
            { type: 'number', min: 0, message: '价格必须大于等于0!' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            precision={6}
            placeholder="请输入当前价格"
            addonBefore="$"
          />
        </Form.Item>
        
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            更新价格
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPriceModal;