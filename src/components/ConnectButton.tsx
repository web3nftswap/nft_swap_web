import { shortenString } from "../utils/utils"
import { useState } from "react";
import { useSubstrateContext } from "./SubstrateProvider"
import { Button, Typography, Space, Dropdown, Menu, message } from "antd"
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api"
import { web3Accounts, web3Enable, web3FromAddress } from "@polkadot/extension-dapp"

const RPC_URL = "ws://127.0.0.1:9944"

const { Text } = Typography

function ConnectButton() {
    const [accountBal, setAccountBal] = useState("")
    const [accountAddr, setAccountAddr] = useState("")
    const [buttonText, setButtonText] = useState("Connect")
    const [dropdownVisible, setDropdownVisible] = useState(false)
    const { api, setApi, setInjector, setAllAccounts, setExtensionEnabled } = useSubstrateContext()

    const init = async() => {
        if (buttonText == "Connect" && !api) {
            const provider = new WsProvider(RPC_URL)
            const _api = await ApiPromise.create({ provider, types: {} })
            console.log("before web3enable")
            console.log(_api)

            const extensions = await web3Enable("my nft dapp")
            let allAccounts
            console.log("before keyring")
            const keyring = new Keyring({type: "sr25519"})
            console.log("before adduri")
            const rata = keyring.addFromUri("//Alice")
            console.log(extensions)
            if (extensions.length === 0) {
                // If extension is not installed use keyring to sign
                allAccounts = [rata]
                console.log(allAccounts)
            } else {
                console.log("get accounts")
                allAccounts = await web3Accounts()
                console.log(allAccounts)
                if (allAccounts.length === 0) {
                    // If extension is installed but has 0 accounts, use keyring to sign transaction.
                    allAccounts = [rata]
                    setExtensionEnabled(false)
                } else {
                    setExtensionEnabled(true)
                    const _injector = await web3FromAddress(allAccounts[0].address)
                    setInjector(_injector)
                }
            }
            const { data : {free: bal}} = await _api.query.system.account(allAccounts[0].address)
            setAllAccounts(allAccounts)
            setApi(_api)
            setButtonText("Disconnect")
            setAccountBal(bal.toString())
            setAccountAddr(allAccounts[0].address)
            setDropdownVisible(true)
        } else if (buttonText == "Disconnect") {
            setAllAccounts([])
            setApi(null)
            setButtonText("Connect")
            setAccountBal("")
            setAccountAddr("")
            setDropdownVisible(false)
        }
    }

    const handleConnect = async () => {
        await init()
    }

    const menu = (
      <Menu>
        <Menu.Item key="0" disabled>
          <Text> addr: {accountAddr} </Text>
        </Menu.Item>
        <Menu.Item key="1" disabled>
          <Text> bal: {accountBal} </Text>
        </Menu.Item>
        <Menu.Item key="disconnect">
          <Button danger onClick={handleConnect}>Disconnect</Button>
        </Menu.Item>
      </Menu>
    );

    return (
      <Space>
        {dropdownVisible ? (
          <Dropdown overlay={menu} trigger={['click']}>
            <Button type="primary" size="large" style={{ width: '120px' }}>{shortenString(accountAddr)}</Button>
          </Dropdown>
        ) : (
          <Button type="primary" size="large" onClick={handleConnect} style={{ width: '120px' }}>
            Connect
          </Button>
        )}
      </Space>
    )
}

export default ConnectButton;
