import React, { useState, useEffect } from 'react';
import { Button, Modal, Progress, Spin, Tooltip, Typography } from 'antd';
import { LineChartOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

const FearGreedIndex = () => {
  const [indexData, setIndexData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    fetchFearGreedIndex();
  }, []);

  const fetchFearGreedIndex = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json();

      if (data && data.data && data.data.length > 0) {
        setIndexData(data.data[0]);
      } else {
        throw new Error('数据格式错误');
      }
    } catch (err) {
      setError(err.message || '获取市场情绪失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      setChartLoading(true);
      const response = await fetch('https://api.alternative.me/fng/?limit=30');
      const data = await response.json();

      if (data && data.data) {
        setHistoricalData(data.data.reverse());
      }
    } catch (err) {
      console.error('获取历史数据失败:', err);
    } finally {
      setChartLoading(false);
    }
  };

  const showModal = () => {
    setModalVisible(true);
    if (historicalData.length === 0) {
      fetchHistoricalData();
    }
  };

  const getIndexColor = (value) => {
    if (value <= 25) return '#bd2d2a';
    if (value <= 45) return '#d97a22';
    if (value <= 55) return '#d8b20f';
    if (value <= 75) return '#6f9f2f';
    return '#177245';
  };

  const getIndexLabel = (value) => {
    if (value <= 25) return '极恐';
    if (value <= 45) return '恐慌';
    if (value <= 55) return '中性';
    if (value <= 75) return '贪婪';
    return '极贪';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="fear-greed-float loading" aria-label="市场情绪加载中">
        <Spin size="small" />
      </div>
    );
  }

  if (error || !indexData) {
    return (
      <Tooltip title="市场情绪加载失败，点击重试">
        <button className="fear-greed-float error" onClick={fetchFearGreedIndex} aria-label="重试市场情绪加载">
          <ReloadOutlined />
        </button>
      </Tooltip>
    );
  }

  const indexValue = parseInt(indexData.value);
  const indexColor = getIndexColor(indexValue);
  const indexLabel = getIndexLabel(indexValue);

  return (
    <>
      <Tooltip title={`市场情绪：${indexValue}/100 ${indexLabel}`}>
        <button
          className="fear-greed-float"
          onClick={showModal}
          aria-label={`市场情绪 ${indexValue}/100 ${indexLabel}`}
        >
          <span
            className="fear-greed-ring"
            style={{
              background: `conic-gradient(${indexColor} ${indexValue * 3.6}deg, rgba(104, 116, 110, 0.14) 0deg)`
            }}
          >
            <span className="fear-greed-core">
              <strong style={{ color: indexColor }}>{indexValue}</strong>
              <span>{indexLabel}</span>
            </span>
          </span>
        </button>
      </Tooltip>

      <Modal
        title="市场情绪指数"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchFearGreedIndex}>
            刷新
          </Button>,
          <Button key="close" type="primary" onClick={() => setModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={760}
      >
        <div className="fear-greed-modal">
          <div className="fear-greed-summary">
            <Progress
              type="circle"
              percent={indexValue}
              format={() => (
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: indexColor }}>
                    {indexValue}
                  </div>
                  <div style={{ fontSize: '12px', color: '#68746e' }}>/100</div>
                </div>
              )}
              strokeColor={indexColor}
              size={132}
            />
            <div>
              <div className="fear-greed-modal-label" style={{ color: indexColor }}>
                {getIndexLabel(indexValue)}
              </div>
              <Text type="secondary">
                更新时间：{formatTimestamp(indexData.timestamp)}
              </Text>
              <br />
              <Text type="secondary">
                数据来源：Alternative.me
              </Text>
            </div>
          </div>

          <div className="history-heading">
            <LineChartOutlined />
            近30天趋势
          </div>

          {chartLoading ? (
            <div className="history-loading">
              <Spin />
              <span>加载历史数据中...</span>
            </div>
          ) : historicalData.length > 0 ? (
            <div className="fear-greed-history">
              {historicalData.map((item) => {
                const value = parseInt(item.value);
                const color = getIndexColor(value);
                const date = new Date(parseInt(item.timestamp) * 1000);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

                return (
                  <Tooltip
                    key={item.timestamp}
                    title={`${date.toLocaleDateString('zh-CN')} · ${value} · ${getIndexLabel(value)}`}
                  >
                    <div className="history-bar-wrap">
                      <div
                        className="history-bar"
                        style={{
                          height: `${Math.max(8, value * 1.8)}px`,
                          backgroundColor: color
                        }}
                      />
                      <span>{dateStr}</span>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          ) : (
            <div className="history-loading">暂无历史数据</div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default FearGreedIndex;
