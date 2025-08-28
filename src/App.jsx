import React from 'react'
import { Layout, Typography, Row, Col, Space } from 'antd'
import { TwitterOutlined } from '@ant-design/icons'
import './App.css'
import { CryptoProvider } from './context/CryptoContext'
import CryptoList from './components/CryptoList'
import InvestmentSummary from './components/InvestmentSummary'
import ApiTokenList from './components/ApiTokenList'
import logoSvg from './assets/logo.svg'

const { Header, Content, Footer } = Layout
const { Title } = Typography

function App() {
  return (
    <CryptoProvider>
      <Layout className="layout">
        <Header className="header">
          <Space align="center">
             <img src={logoSvg} alt="CryptoDCA Logo" style={{ height: '40px' }} />
             <Title level={3} style={{ color: 'white', margin: 0 }}>
               加密货币定投计划CryptoDCA
             </Title>
           </Space>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <div className="site-layout-content" style={{ padding: 24, minHeight: 'calc(100vh - 134px)' }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <InvestmentSummary />
              </Col>
              <Col span={24}>
                <CryptoList />
              </Col>
            </Row>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', background: '#f0f2f5', padding: '24px 0' }}>
          <Space direction="vertical" size="small">
            <div>
              CryptoDCA ©2025 - 加密货币定投统计工具
            </div>
            <div>
              <Space>
                <span>关注开发者：</span>
                <a href="https://x.com/xa_yyws" target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>
                  <TwitterOutlined style={{ marginRight: '4px' }} />
                  @xa_yyws
                </a>
              </Space>
            </div>
          </Space>
        </Footer>
      </Layout>
    </CryptoProvider>
  )
}

export default App
