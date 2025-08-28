import React, { useEffect, useState, useRef } from 'react';
import { Table, Tag, Button, Space, Modal, message } from 'antd';
import { DeleteOutlined, ReloadOutlined, PlusOutlined, DollarOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useCrypto } from '../context/CryptoContext';
import { CryptoStatus } from '../models/CryptoData';
import AddCryptoForm from './AddCryptoForm';
import AddTransactionForm from './AddTransactionForm';

const CryptoList = () => {
  const { cryptoList, deleteCrypto, updateAllPricesFromApi, loading, exportData, importData } = useCrypto();
  const [isAddCryptoModalVisible, setIsAddCryptoModalVisible] = useState(false);
  const [isAddTransactionModalVisible, setIsAddTransactionModalVisible] = useState(false);
  const fileInputRef = useRef(null);
  
  // 数字格式化函数
  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };
  
  // 价格格式化函数
  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) return '$0.00';
    // 如果价格大于1，显示2位小数；如果小于1，显示4位小数
    const decimals = price >= 1 ? 2 : 4;
    return `$${formatNumber(price, decimals)}`;
  };
  
  // 处理导出数据
  const handleExportData = () => {
    if (cryptoList.length === 0) {
      message.warning('没有数据可以导出');
      return;
    }
    exportData();
    message.success('数据导出成功');
  };
  
  // 处理导入数据
  const handleImportData = () => {
    fileInputRef.current?.click();
  };
  
  // 处理文件选择
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const count = await importData(file);
      message.success(`数据导入成功，共导入 ${count} 个加密货币`);
    } catch (error) {
      message.error(`导入失败: ${error.message}`);
    }
    
    // 清空文件输入
    event.target.value = '';
  };
  
  // 定义表格列
  const columns = [
    {
      title: '币种',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text, record) => (
        <span>
          <strong>{text}</strong>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.name}</div>
        </span>
      ),
    },
    {
      title: '当前价格',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (price) => formatPrice(price),
      sorter: (a, b) => a.currentPrice - b.currentPrice,
    },
    {
      title: '平均成本',
      dataIndex: 'averageCost',
      key: 'averageCost',
      render: (cost) => formatPrice(cost),
      sorter: (a, b) => a.averageCost - b.averageCost,
    },
    {
      title: '持有数量',
      dataIndex: 'holdingAmount',
      key: 'holdingAmount',
      render: (amount) => formatNumber(amount, 4),
      sorter: (a, b) => a.holdingAmount - b.holdingAmount,
    },
    {
      title: '投入金额',
      dataIndex: 'investmentAmount',
      key: 'investmentAmount',
      render: (amount) => `$${formatNumber(amount, 2)}`,
      sorter: (a, b) => a.investmentAmount - b.investmentAmount,
    },
    {
      title: '当前价值',
      dataIndex: 'currentValue',
      key: 'currentValue',
      render: (value) => `$${formatNumber(value, 2)}`,
      sorter: (a, b) => a.currentValue - b.currentValue,
    },
    {
      title: '利润/亏损',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit) => {
        const color = profit > 0 ? 'green' : profit < 0 ? 'red' : '';
        return <span style={{ color }}>${formatNumber(profit, 2)}</span>;
      },
      sorter: (a, b) => a.profit - b.profit,
    },
    {
      title: '收益率',
      dataIndex: 'profitRate',
      key: 'profitRate',
      render: (rate) => {
        const color = rate > 0 ? 'green' : rate < 0 ? 'red' : '';
        return <span style={{ color }}>{formatNumber(rate, 2)}%</span>;
      },
      sorter: (a, b) => a.profitRate - b.profitRate,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        let text = '持平';
        
        if (status === CryptoStatus.PROFIT) {
          color = 'green';
          text = '盈利';
        } else if (status === CryptoStatus.LOSS) {
          color = 'red';
          text = '亏损';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: '盈利', value: CryptoStatus.PROFIT },
        { text: '亏损', value: CryptoStatus.LOSS },
        { text: '持平', value: CryptoStatus.NEUTRAL },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => deleteCrypto(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="crypto-list">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsAddCryptoModalVisible(true)}
          >
            添加币种
          </Button>
          <Button 
            type="default" 
            icon={<DollarOutlined />}
            onClick={() => setIsAddTransactionModalVisible(true)}
          >
            添加交易
          </Button>
          <Button 
            type="default" 
            icon={<DownloadOutlined />}
            onClick={handleExportData}
          >
            导出数据
          </Button>
          <Button 
            type="default" 
            icon={<UploadOutlined />}
            onClick={handleImportData}
          >
            导入数据
          </Button>
        </Space>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={updateAllPricesFromApi}
          loading={loading}
        >
          更新全部价格
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={cryptoList} 
        rowKey="id" 
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
      
      <Modal
        title="添加加密货币"
        open={isAddCryptoModalVisible}
        onCancel={() => setIsAddCryptoModalVisible(false)}
        footer={null}
        width={600}
      >
        <AddCryptoForm onSuccess={() => setIsAddCryptoModalVisible(false)} />
      </Modal>
      
      <Modal
        title="添加交易记录"
        open={isAddTransactionModalVisible}
        onCancel={() => setIsAddTransactionModalVisible(false)}
        footer={null}
        width={500}
      >
        <AddTransactionForm onSuccess={() => setIsAddTransactionModalVisible(false)} />
      </Modal>
      
      {/* 隐藏的文件输入元素 */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default CryptoList;