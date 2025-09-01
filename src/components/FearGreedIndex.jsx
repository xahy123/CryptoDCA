import React, { useState, useEffect } from 'react';
import { Card, Spin, Alert, Progress, Typography, Tooltip, Button, Modal } from 'antd';
import { InfoCircleOutlined, LineChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const FearGreedIndex = () => {
  const [indexData, setIndexData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [chartModalVisible, setChartModalVisible] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    fetchFearGreedIndex();
  }, []);

  const fetchFearGreedIndex = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json();
      
      if (data && data.data && data.data.length > 0) {
        setIndexData(data.data[0]);
        setError(null);
      } else {
        setError('无法获取恐慌指数数据');
      }
    } catch (err) {
      setError('获取恐慌指数失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      setChartLoading(true);
      const response = await fetch('https://api.alternative.me/fng/?limit=30');
      const data = await response.json();
      
      if (data && data.data && data.data.length > 0) {
        setHistoricalData(data.data.reverse()); // 反转数组以按时间顺序显示
      }
    } catch (err) {
      console.error('获取历史数据失败:', err);
    } finally {
      setChartLoading(false);
    }
  };

  const showChart = () => {
    setChartModalVisible(true);
    if (historicalData.length === 0) {
      fetchHistoricalData();
    }
  };

  const getIndexColor = (value) => {
    if (value <= 25) return '#f5222d'; // 极度恐慌 - 红色
    if (value <= 45) return '#fa8c16'; // 恐慌 - 橙色
    if (value <= 55) return '#fadb14'; // 中性 - 黄色
    if (value <= 75) return '#52c41a'; // 贪婪 - 绿色
    return '#13c2c2'; // 极度贪婪 - 青色
  };

  const getIndexLabel = (value) => {
    if (value <= 25) return '极度恐慌';
    if (value <= 45) return '恐慌';
    if (value <= 55) return '中性';
    if (value <= 75) return '贪婪';
    return '极度贪婪';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card title="恐慌指数" style={{ marginBottom: 16 }}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 8 }}>加载中...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="恐慌指数" style={{ marginBottom: 16 }}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <button 
              onClick={fetchFearGreedIndex}
              style={{
                background: 'none',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            >
              重试
            </button>
          }
        />
      </Card>
    );
  }

  if (!indexData) {
    return null;
  }

  const indexValue = parseInt(indexData.value);
  const indexColor = getIndexColor(indexValue);
  const indexLabel = getIndexLabel(indexValue);

  return (
    <>
      <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>恐慌指数</span>
          <Tooltip title="恐慌指数反映市场情绪，0表示极度恐慌，100表示极度贪婪">
            <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        </div>
      }
      extra={
        <Button 
          type="text" 
          icon={<LineChartOutlined />}
          onClick={showChart}
          size="small"
        >
          历史趋势
        </Button>
      }
      style={{ marginBottom: 16 }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          <Progress
            type="circle"
            percent={indexValue}
            format={() => (
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: indexColor }}>
                  {indexValue}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  {indexLabel}
                </div>
              </div>
            )}
            strokeColor={indexColor}
            size={120}
          />
        </div>
        
        <div style={{ marginBottom: 8 }}>
          <Text strong style={{ color: indexColor, fontSize: '16px' }}>
            {indexLabel}
          </Text>
        </div>
        
        <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
          更新时间: {formatTimestamp(indexData.timestamp)}
        </div>
        
        <div style={{ marginTop: 12, padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <Text style={{ fontSize: '12px', color: '#666' }}>
            数据来源: Alternative.me
          </Text>
        </div>
      </div>
    </Card>
    
    <Modal
      title="恐慌指数历史趋势（近30天）"
      open={chartModalVisible}
      onCancel={() => setChartModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setChartModalVisible(false)}>
          关闭
        </Button>
      ]}
      width={800}
    >
      {chartLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 8 }}>加载历史数据中...</div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <Text type="secondary">
              恐慌指数历史走势图 - 数据来源: Alternative.me
            </Text>
          </div>
          
          {historicalData.length > 0 ? (
            <div style={{ height: '400px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'end', height: '350px', gap: '4px', minWidth: '600px' }}>
                {historicalData.map((item, index) => {
                  const value = parseInt(item.value);
                  const color = getIndexColor(value);
                  const height = (value / 100) * 300; // 最大高度300px
                  const date = new Date(parseInt(item.timestamp) * 1000);
                  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                  
                  return (
                    <Tooltip 
                      key={index}
                      title={
                        <div>
                          <div>日期: {date.toLocaleDateString('zh-CN')}</div>
                          <div>指数: {value}</div>
                          <div>状态: {getIndexLabel(value)}</div>
                        </div>
                      }
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div
                          style={{
                            width: '100%',
                            minWidth: '16px',
                            height: `${height}px`,
                            backgroundColor: color,
                            borderRadius: '2px 2px 0 0',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        />
                        <div style={{ 
                          fontSize: '10px', 
                          color: '#666', 
                          marginTop: '4px',
                          transform: 'rotate(-45deg)',
                          transformOrigin: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          {dateStr}
                        </div>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
              
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                <span>极度恐慌 (0-25)</span>
                <span>恐慌 (25-45)</span>
                <span>中性 (45-55)</span>
                <span>贪婪 (55-75)</span>
                <span>极度贪婪 (75-100)</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text type="secondary">暂无历史数据</Text>
            </div>
          )}
        </div>
      )}
     </Modal>
   </>
  );
};

export default FearGreedIndex;