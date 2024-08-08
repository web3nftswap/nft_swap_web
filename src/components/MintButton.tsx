import { useSubstrateContext } from "./SubstrateProvider"
import { signAndSend } from "../utils/utils"
import { Button, Modal, Form, Input, InputNumber, message } from 'antd'
import { useState } from "react";
import { web3Accounts, web3Enable, web3FromAddress } from "@polkadot/extension-dapp"

function MintButton() {
  const [nftAddr, setNftAddr] = useState('')
  const [dialogShown, setDialogShown] = useState(false)
  const { api, injector, allAccounts, extensionEnabled } = useSubstrateContext()
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()

  const handleMint = () => {
    if (allAccounts.length === 0) {
      return messageApi.warning('Please connect wallet first.')
    }

    setDialogShown(true)
  }

  const handleClose = () => {
    form.resetFields()
    setDialogShown(false)
  }

  const handleSubmit = async () => {
    const values = form.getFieldsValue()
    console.log(values)

    if (!nftAddr.trim()) {
      return messageApi.warning('Please input NFT collection id.')
    }

    const tx = api.tx.nftModule.mintNft(nftAddr, 0x0)
    const hash = await signAndSend(tx, allAccounts[0], extensionEnabled, injector)
    console.log(hash.toHex())
    messageApi.success(`Mint hash ${hash}`)

    setDialogShown(false)
  }

  return (
    <div>
      {contextHolder}
      <Button type="primary" size="large" onClick={handleMint}> Mint </Button>
      <Modal title="Mint NFT" open={dialogShown} onOk={() => form.submit()} onCancel={handleClose}>
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={handleSubmit}>
          <Form.Item label="Collection ID" name="collection_id" rules={[{ required: true, message: 'Please input NFT collection ID!' }]}>
            <Input type="text" value={nftAddr} onChange={(e) => setNftAddr(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MintButton;
