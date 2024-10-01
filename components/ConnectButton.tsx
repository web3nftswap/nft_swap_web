"use client";

import React, { useState, useEffect } from "react";
import { useSubstrateContext } from "@/app/SubstrateProvider";
import { HoveredLi, Menu, MenuItem } from "./ui/connect-btn";
import {
  web3Enable,
  web3Accounts,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import { InjectedAccount } from "@polkadot/extension-inject/types";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";

const RPC_URL = "ws://127.0.0.1:9944";

const ConnectButton = () => {
  // State management
  const [active, setActive] = useState<string | null>(null);
  const [accountBal, setAccountBal] = useState<string>("");
  const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
  const [accountAddr, setAccountAddr] = useState<string>("");
  const [buttonText, setButtonText] = useState<string>("Connect");
  const [isConnect, setIsConnect] = useState<boolean>(false);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const {
    api,
    setApi,
    setInjector,
    allAccounts,
    setAllAccounts,
    setExtensionEnabled,
  } = useSubstrateContext();

  // Initialize connection
  const initConnection = async () => {
    const provider = new WsProvider(RPC_URL);
    const _api = await ApiPromise.create({ provider, types: {} });
    return _api;
  };

  // Handle account retrieval
  const fetchAccounts = async (extensions: any[]): Promise<any[]> => {
    const keyring = new Keyring({ type: "sr25519" });
    if (extensions.length === 0) {
      return [keyring.addFromUri("//Alice")];
    } else {
      const allAcc = await web3Accounts();
      setAccounts(allAcc);
      return allAcc.length > 0 ? allAcc : [keyring.addFromUri("//Alice")];
    }
  };

  // Handle account balance retrieval
  const fetchBalance = async (
    account: string,
    _api: ApiPromise
  ): Promise<string> => {
    const accountInfo = await _api.query.system.account(account);
    return accountInfo.data.free.toString();
  };

  // Main connection logic
  const handleConnect = async () => {
    if (buttonText === "Connect" && !api) {
      const _api = await initConnection();
      const extensions = await web3Enable("nft swap");

      if (extensions.length === 0) {
        alert("请安装 Polkadot.js 扩展！");
        return;
      }

      const curAllAccounts = await fetchAccounts(extensions);
      const bal = await fetchBalance(curAllAccounts[0].address, _api);

      setAllAccounts(curAllAccounts);
      setApi(_api);
      setButtonText("Disconnect");
      setIsConnect(true);
      setAccountBal(bal.toString());
      setAccountAddr(curAllAccounts[0].address);
      setDropdownVisible(true);

      const _injector = await web3FromAddress(curAllAccounts[0].address);
      setInjector(_injector);
      setExtensionEnabled(true);
    } else if (buttonText === "Disconnect") {
      setAllAccounts([]);
      setApi(undefined);
      setButtonText("Connect");
      setIsConnect(false);
      setAccountBal("");
      setAccountAddr("");
      setDropdownVisible(false);
    }
  };

  // Shorten account address
  const displayAddress = (address: string) => {
    return address ? (
      <>
        <span className="text-purple-200">Ox:</span>
        {address.slice(0, 6)}...{address.slice(-4)}
      </>
    ) : (
      ""
    );
  };

  return (
    <div>
      <Menu setActive={setActive} setDropdownVisible={setDropdownVisible}>
        <MenuItem
          setActive={setActive}
          active={active}
          isConnect={isConnect}
          dropdownVisible={dropdownVisible}
          setDropdownVisible={setDropdownVisible}
          item="Connect"
          title={!isConnect ? "Connect" : displayAddress(accountAddr)}
          handleConnect={handleConnect}
        >
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLi>Switch Account</HoveredLi>
            <HoveredLi onClick={() => handleConnect()}>
              <span className="text-red-400 hover:font-semibold ">
                Disconnect
              </span>{" "}
            </HoveredLi>
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ConnectButton;
