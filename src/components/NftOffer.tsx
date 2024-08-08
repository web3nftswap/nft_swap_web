import { useSubstrateContext } from "./SubstrateProvider"
import { signAndSend } from "../utils/utils"
import { List, Button, Form, Modal, Input, InputNumber, Card, Descriptions, message } from "antd"
import { Address } from '@ant-design/web3'
import { useState } from "react";

type OfferItem = {
  collectionId: string
  itemId: number
  offerCollectionId: string
  offerItemId: number
}

function ShowRecvOfferButton() {
  const { api, allAccounts, setRecvOffer } = useSubstrateContext()
  const [messageApi, contextHolder] = message.useMessage()
  const signer = allAccounts[0]

  const handleShowRecvOffer = async () => {
    if (allAccounts.length === 0) {
      return messageApi.warning('Please connect wallet first.')
    }

    let offer_items: OfferItem[] = []
    let data = await api.query.nftModule.ownedNFTs(signer.address)
    const owned_nfts = JSON.parse(data.unwrap().toString())
    console.log(owned_nfts)
    for (let owned_nft of owned_nfts) {
      data = await api.query.nftMarketModule.offers(owned_nft)
      if (data.isSome) {
        let offers = JSON.parse(data.unwrap().toString())
        for (let offer of offers) {
          offer_items.push({
            collectionId: owned_nft[0],
            itemId: owned_nft[1],
            offerCollectionId: offer[0],
            offerItemId: offer[1],
          })
        }
      }
    }
    console.log(offer_items)
    setRecvOffer(offer_items)
  }

  return (
    <div>
      {contextHolder}
      <Button type="primary" size="large" style={{width:"75px"}} onClick={handleShowRecvOffer}> RecvOffer </Button>
    </div>
  )
}

function ShowIssOfferButton() {
  const { api, allAccounts, setIssuedOffer } = useSubstrateContext()
  const [messageApi, contextHolder] = message.useMessage()
  const signer = allAccounts[0]

  const handleShowIssOffer = async () => {
    if (allAccounts.length === 0) {
      return messageApi.warning('Please connect wallet first.')
    }
  }

  return (
    <div>
      {contextHolder}
      <Button type="primary" size="large" style={{width:"75px"}} onClick={handleShowIssOffer}> IssuedOffer </Button>
    </div>
  )
}

function OfferList() {
  const { api, injector, allAccounts, extensionEnabled, recvOffer, setRecvOffer, issuedOffer, setIssuedOffer } = useSubstrateContext()
  const [messageApi, contextHolder] = message.useMessage()
  const signer = allAccounts[0]

  console.log(recvOffer)

  const handleOfferAccept = async (offer) => {
    if (allAccounts.length === 0) {
      return messageApi.warning('Please connect wallet first.')
    }

    const tx = api.tx.nftMarketModule.acceptOffer([offer.collectionId, offer.itemId], [offer.offerCollectionId, offer.offerItemId])
    const hash = await signAndSend(tx, signer, extensionEnabled, injector)
    console.log(hash.toHex())
    messageApi.success(`Accept offer hash ${hash}`)
  }

  const handleOfferReject = async () => {
    if (allAccounts.length === 0) {
      return messageApi.warning('Please connect wallet first.')
    }
  }

  return (
    <div>
      {contextHolder}
      <List
        grid={{ gutter: 20, xs: 1, sm: 2, md: 3 }}
        dataSource={recvOffer}
        renderItem={offer => (
          <List.Item>
            <Card
              title="Received Offer Details"
              style={{ width: 280 }}
            >
              <div>
                <span>Collection ID: </span>
                <Address address={offer.collectionId} ellipsis={{ headClip: 4, tailClip: 3 }} copyable />
              </div>
              <div>
                <span>Item ID: {offer.itemId}</span>
              </div>
              -------------------
              <div>
                <span>Offer Collection ID: </span>
                <Address address={offer.offerCollectionId} ellipsis={{ headClip: 4, tailClip: 3 }} copyable />
              </div>
              <div>
                <span>Offer Item ID: {offer.offerItemId}</span>
              </div>
            </Card>
            <Button style={{ width : 120, marginRight: "40px", backgroundColor: "white", color: "black", border: "1px solid #d9d9d9" }} onClick={() => handleOfferAccept(offer)} type="primary"> Accept </Button>
            <Button style={{ width : 120, backgroundColor: "white", color: "black", border: "1px solid #d9d9d9" }} onClick={() => handleOfferReject(offer)} type="primary"> Reject </Button>
          </List.Item>
        )}
      />
    </div>
  )
}

export {ShowRecvOfferButton, ShowIssOfferButton, OfferList}

