import React, { useState } from 'react';
import { Button, Card, Col, Divider, Modal, Row, Statistic, Typography } from 'antd';
import { BarChartOutlined, CalendarOutlined } from '@ant-design/icons';
import { useCrypto } from '../context/CryptoContext';
import FearGreedIndex from './FearGreedIndex';

// 数字格式化函数
const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

const { Title, Text } = Typography;

const InvestmentSummary = () => {
  const { cryptoList } = useCrypto();

  // 计算总投资概况
  const calculateSummary = () => {
    let totalInvestment = 0;
    let totalCurrentValue = 0;
    let earliestTransactionDate = null;

    cryptoList.forEach(crypto => {
      totalInvestment += crypto.investmentAmount || 0;
      totalCurrentValue += (crypto.currentPrice || 0) * (crypto.holdingAmount || 0);
      
      // 查找最早的交易日期
      if (crypto.transactions && crypto.transactions.length > 0) {
        crypto.transactions.forEach(transaction => {
          const transactionDate = new Date(transaction.date);
          if (!earliestTransactionDate || transactionDate < earliestTransactionDate) {
            earliestTransactionDate = transactionDate;
          }
        });
      }
    });

    const totalProfitLoss = totalCurrentValue - totalInvestment;
    const overallReturn = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

    return {
      totalInvestment,
      totalCurrentValue,
      totalProfitLoss,
      overallReturn,
      earliestTransactionDate
    };
  };

  const summary = calculateSummary();
  const currentDate = new Date().toLocaleDateString('zh-CN');

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showSummaryModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Card 
        title={
          <div className="section-title">
            <span>投资总览</span>
            <span className="section-kicker">DCA ledger</span>
          </div>
        }
        className="investment-summary"
        extra={
          <Button 
            type="text"
            icon={<BarChartOutlined />}
            onClick={showSummaryModal}
            className="quiet-action"
          >
            详细总结
          </Button>
        }
      >
        <Row gutter={[12, 12]} className="metric-grid">
          <Col xs={12} md={6}>
            <Statistic title="总投入" value={`$${formatNumber(summary.totalInvestment, 2)}`} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="当前价值" value={`$${formatNumber(summary.totalCurrentValue, 2)}`} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic
              title="利润/亏损"
              value={`${summary.totalProfitLoss >= 0 ? '+' : '-'}$${formatNumber(Math.abs(summary.totalProfitLoss), 2)}`}
              valueStyle={{ color: summary.totalProfitLoss >= 0 ? 'var(--gain)' : 'var(--loss)' }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic
              title="收益率"
              value={`${summary.overallReturn >= 0 ? '+' : '-'}${formatNumber(Math.abs(summary.overallReturn), 2)}%`}
              valueStyle={{ color: summary.overallReturn >= 0 ? 'var(--gain)' : 'var(--loss)' }}
            />
          </Col>
        </Row>
      
      <Divider className="summary-divider" />
      
      <Row justify="space-between" align="middle" gutter={[12, 8]} className="summary-meta">
        <Col>
          <Text type="secondary">
            <CalendarOutlined /> 开始日期：{summary.earliestTransactionDate 
              ? summary.earliestTransactionDate.toLocaleDateString('zh-CN')
              : '暂无记录'
            }
          </Text>
        </Col>
        <Col>
          <Text type="secondary">
            当前日期：{currentDate} · 标的数量：{cryptoList.length}
          </Text>
        </Col>
      </Row>
      </Card>
      
      <FearGreedIndex />

      <Modal
        title="加密货币定投计划总览"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" type="primary" onClick={handleModalClose}>
            关闭
          </Button>
        ]}
        width={600}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              投资计划概览
            </Title>
            <Divider style={{ margin: '12px 0' }} />
          </div>
          
          <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
             <Col span={12}>
               <Text strong>计划开始日期：</Text>
               <br />
               <Text>
                 {summary.earliestTransactionDate 
                   ? summary.earliestTransactionDate.toLocaleDateString('zh-CN')
                   : '暂无交易记录'
                 }
               </Text>
             </Col>
            <Col span={12}>
              <Text strong>当前日期：</Text>
              <br />
              <Text>{currentDate}</Text>
            </Col>
          </Row>
          
          <Divider orientation="left">投资概况</Divider>
          
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px' }}>
                <Text strong style={{ color: '#1890ff' }}>总投入金额</Text>
                <br />
                <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  ${formatNumber(summary.totalInvestment, 2)}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ padding: '12px', backgroundColor: '#f6ffed', borderRadius: '6px' }}>
                <Text strong style={{ color: '#52c41a' }}>当前总价值</Text>
                <br />
                <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  ${formatNumber(summary.totalCurrentValue, 2)}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ 
                padding: '12px', 
                backgroundColor: summary.totalProfitLoss >= 0 ? '#f6ffed' : '#fff2f0', 
                borderRadius: '6px' 
              }}>
                <Text strong style={{ color: summary.totalProfitLoss >= 0 ? '#52c41a' : '#ff4d4f' }}>
                  总利润/亏损
                </Text>
                <br />
                <Text style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: summary.totalProfitLoss >= 0 ? '#52c41a' : '#ff4d4f'
                }}>
                  {summary.totalProfitLoss >= 0 ? '+' : '-'}${formatNumber(Math.abs(summary.totalProfitLoss), 2)}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ 
                padding: '12px', 
                backgroundColor: summary.overallReturn >= 0 ? '#f6ffed' : '#fff2f0', 
                borderRadius: '6px' 
              }}>
                <Text strong style={{ color: summary.overallReturn >= 0 ? '#52c41a' : '#ff4d4f' }}>
                  整体收益率
                </Text>
                <br />
                <Text style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: summary.overallReturn >= 0 ? '#52c41a' : '#ff4d4f'
                }}>
                  {summary.overallReturn >= 0 ? '+' : ''}{formatNumber(Math.abs(summary.overallReturn), 2)}%
                </Text>
              </div>
            </Col>
          </Row>
          
          <Divider />
          
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              投资组合数量：{cryptoList.length} 个 | 坚持定投，长期持有
            </Text>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default InvestmentSummary;
