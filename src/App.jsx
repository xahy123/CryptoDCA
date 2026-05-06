import React from 'react'
import { Layout, Typography, Space, Tag } from 'antd'
import { DatabaseOutlined, TwitterOutlined } from '@ant-design/icons'
import './App.css'
import { CryptoProvider } from './context/CryptoContext'
import CryptoList from './components/CryptoList'
import InvestmentSummary from './components/InvestmentSummary'
import logoSvg from './assets/logo.svg'

const { Header, Content, Footer } = Layout
const { Text } = Typography

function App() {
  return (
    <CryptoProvider>
      <Layout className="layout">
        <Header className="header">
          <div className="header-inner">
            <Space align="center" size={12}>
              <img src={logoSvg} alt="CryptoDCA Logo" className="brand-logo" />
              <div>
                <div className="brand-title">CryptoDCA</div>
                <Text className="brand-subtitle">加密货币定投账本</Text>
              </div>
            </Space>
            <Tag className="source-tag" icon={<DatabaseOutlined />}>
              CoinGecko
            </Tag>
          </div>
        </Header>
        <Content className="app-content">
          <div className="site-layout-content">
            <InvestmentSummary />
            <CryptoList />
          </div>
        </Content>
        <Footer className="app-footer">
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
