import { Layout, Flex, Space, Button } from "antd"
import MintButton from "./MintButton"
import ConnectButton from "./ConnectButton"
import { ShowMyNftButton, ShowOtherNftButton, NftList } from "./NftList"
import { ShowRecvOfferButton, ShowIssOfferButton, OfferList } from "./NftOffer"
import { SubstrateProvider } from "./SubstrateProvider"

function App() {
    return (
      <SubstrateProvider>
        <div className="App">
          <Layout>
            <Layout.Header style={{ backgroundColor: "#ccc" }}>
              <Space style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div style={{ display: "flex", gap: "20px" }}>
                  <MintButton></MintButton>
                  <ShowMyNftButton></ShowMyNftButton>
                  <ShowOtherNftButton></ShowOtherNftButton>
                  <ShowRecvOfferButton></ShowRecvOfferButton>
		  {/*<ShowIssOfferButton></ShowIssOfferButton>*/}
                </div>
                <div>
                  <ConnectButton></ConnectButton>
                </div>
              </Space>
            </Layout.Header>
            <Layout.Content>
              <div style={{ maxWidth: 1280, margin: "0 auto", padding: 24 }}>
                <NftList></NftList> 
                <OfferList></OfferList> 
              </div>
            </Layout.Content>
          </Layout>
        </div>
      </SubstrateProvider>
    )
}

export default App;
