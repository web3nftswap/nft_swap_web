import { useSubstrateContext } from "./SubstrateProvider"
import { signAndSend } from "../utils/utils"
import { List, Button, Form, Modal, Input, InputNumber, message } from "antd"
import { useState } from "react";
import { NFTCard, Address } from "@ant-design/web3"
import type { NftItem } from "./NftCard"
import { NftCardFooter }from "./NftCard"

const DEFAULT_URL = "https://pic1.zhimg.com/80/v2-79eccd1a9f8562d1e586d8cd14664170_1440w.webp"

function resolveActionText(nft: NftItem, account: any): string {
  if (!account) {
    return "Buy"
  }

  if (nft.owner === account.address) {
    return nft.isListed ? "Unlist" : "List"
  } else {
    return nft.isListed ? "Buy" : "Not for sale"
  }
}

const handleShowNft = async (api: any, signer: any, collection_id: string, showMyNft: boolean) => {
  let data = await api.query.nftModule.nftCollections(collection_id)
  const [_, item_num, info] = JSON.parse(data.unwrap().toString())
  console.log(`nft data: ${item_num}, ${info}`)

  let _nfts: NftItem[] = []
  let account_id
  let isListed
  if (showMyNft) {
    for (let i = 0; i < item_num; i++) {
      data = await api.query.nftModule.nftOwners([collection_id, i])
      account_id = data.unwrap().toString()
      isListed = await api.query.nftMarketModule.listings([collection_id, i])
      if (signer.address === account_id) {
        _nfts.push({
          owner: account_id,
          collectionId: collection_id,
          itemId: i,
          isListed: isListed.isSome
        })
      }
    }
  } else {
    for (let i = 0; i < item_num; i++) {
      data = await api.query.nftModule.nftOwners([collection_id, i])
      account_id = data.unwrap().toString()
      isListed = await api.query.nftMarketModule.listings([collection_id, i])
      if (signer.address !== account_id) {
        _nfts.push({
          owner: account_id,
          collectionId: collection_id,
          itemId: i,
          isListed: isListed.isSome
        })
      }
    }
  }
  console.log(_nfts)
  return _nfts
}

function ShowMyNftButton() {
  const { api, allAccounts, setNfts } = useSubstrateContext()
  const [messageApi, contextHolder] = message.useMessage()

  const handleShowMyNft = async () => {
    if (allAccounts.length === 0) {
      return messageApi.warning('Please connect wallet first.')
    }

    let data = await api.query.nftModule.nftCollectionIds()
    const collection_id = data.unwrap()[0].toString() // 目前只支持第0个collection
    console.log(collection_id)
    setNfts(await handleShowNft(api, allAccounts[0], collection_id, true))
  }

  return (
    <div>
      {contextHolder}
      <Button type="primary" size="large" style={{width:"75px"}} onClick={handleShowMyNft}> MyNFT </Button>
    </div>
  )
}

function ShowOtherNftButton() {
  const { api, allAccounts, setNfts } = useSubstrateContext()
  const [messageApi, contextHolder] = message.useMessage()

  const handleShowOtherNft = async () => {
    if (allAccounts.length === 0) {
      return messageApi.warning('Please connect wallet first.')
    }

    let data = await api.query.nftModule.nftCollectionIds()
    const collection_id = data.unwrap()[0].toString() // 目前只支持第0个collection
    console.log(collection_id)
    setNfts(await handleShowNft(api, allAccounts[0], collection_id, false))
  }

  return (
    <div>
      {contextHolder}
      <Button type="primary" size="large" style={{width:"75px"}} onClick={handleShowOtherNft}> OtherNFT </Button>
    </div>
  )
}

function NftList() {
  const { api, injector, allAccounts, extensionEnabled, nfts, setNfts } = useSubstrateContext()
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()
  const [offerDialogShown, setOfferDialogShown] = useState(false)
  const [nftForOffer, setNftForOffer] = useState(undefined)

  const operateNft = async (nft: NftItem) => {
    const signer = allAccounts[0]
    if (!signer) {
      return messageApi.warning("Please connect wallet first.")
    }

    const listNft = async (nft: NftItem) => {
      const tx = api.tx.nftMarketModule.listNft([nft.collectionId, nft.itemId])
      const hash = await signAndSend(tx, signer, extensionEnabled, injector)
      console.log(hash.toHex())
      messageApi.success(`List hash ${hash}`)

      nft.isListed = true
      setNfts(nfts => nfts.map((_nft) => _nft.itemId == nft.itemId ? {..._nft, ...nft} : _nft));
    }

    if (nft.owner === signer.address) {
      if (nft.isListed) {
        // unlist
      } else {
        // list
        await listNft(nft)
      }
    } else {
      if (nft.isListed) {
        // buy
        setNftForOffer(nft)
        setOfferDialogShown(true)
      } else {
        // cancel
      }
    }
  }

  const handleOfferSubmit = async () => {
    const signer = allAccounts[0]
    if (!signer) {
      return messageApi.warning("Please connect wallet first.")
    }

    const values = form.getFieldsValue()
    console.log(nftForOffer.collectionId, nftForOffer.itemId, values.collectionId, values.itemId)
    const tx = api.tx.nftMarketModule.placeOffer([nftForOffer.collectionId, nftForOffer.itemId], [values.collectionId, values.itemId])
    const hash = await signAndSend(tx, signer, extensionEnabled, injector)
    console.log(hash.toHex())
    messageApi.success(`Offer hash ${hash}`)

    nftForOffer.isOffered = true
    setOfferDialogShown(false)
  }

  const handleOfferClose = () => {
    form.resetFields()
    setOfferDialogShown(false)
  }

  return (
    <div>
      {contextHolder}
      <List
        grid={{ gutter: 20, xs: 2, sm: 3, md: 6 }}
        dataSource={nfts}
        renderItem={nft => (
          <List.Item>
            <NFTCard
              key={`${nft.collectionId}#${nft.itemId}`}
              tokenId={nft.itemId}
              image={DEFAULT_URL}
              footer={<NftCardFooter dataSource={nft} />}
              showAction
              actionText={resolveActionText(nft, allAccounts[0])}
              onActionClick={() => operateNft(nft)}
            />
            <Modal title="Offer NFT" open={offerDialogShown} onOk={() => form.submit()} onCancel={handleOfferClose}>
              <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={() => handleOfferSubmit()}>
                <Form.Item label="Collection ID" name="collectionId" rules={[{ required: true, message: 'Please input NFT collection ID!' }]}>
                  <Input ellipsis={{ headClip: 8, tailClip: 6 }} copyable />
                </Form.Item>
                <Form.Item label="Item ID" name="itemId" rules={[{ required: true, message: 'Please input NFT token ID!' }]}>
                  <InputNumber min={0} precision={0} addonBefore="#" style={{ width: '100%' }} />
                </Form.Item>
              </Form>
            </Modal>
          </List.Item>
        )}
      />
    </div>
  )
}

export {ShowMyNftButton, ShowOtherNftButton, NftList}

