// api/SubstrateProvider.tsx
"use client";

import React, { createContext, useState, ReactNode, useEffect } from "react";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import {
  InjectedExtension,
  InjectedAccount,
} from "@polkadot/extension-inject/types";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";
const RPC_URL = "ws://127.0.0.1:9944";

interface SubstrateContextProps {
  api: ApiPromise | undefined;
  setApi: React.Dispatch<React.SetStateAction<ApiPromise | undefined>>;
  injector: InjectedExtension | undefined;
  setInjector: React.Dispatch<
    React.SetStateAction<InjectedExtension | undefined>
  >;
  allAccounts: InjectedAccount[];
  setAllAccounts: React.Dispatch<React.SetStateAction<InjectedAccount[]>>;
  extensionEnabled: boolean;
  setExtensionEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  nfts: any[];
  setNfts: React.Dispatch<React.SetStateAction<any[]>>;
  recvOffer: any[];
  setRecvOffer: React.Dispatch<React.SetStateAction<any[]>>;
  issuedOffer: any[];
  setIssuedOffer: React.Dispatch<React.SetStateAction<any[]>>;
  initConnection: () => Promise<ApiPromise>;
  pending: boolean;
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}

const SubstrateContext = createContext<SubstrateContextProps | undefined>(
  undefined
);

interface SubstrateProviderProps {
  children: ReactNode;
}

export const SubstrateProvider: React.FC<SubstrateProviderProps> = ({
  children,
}) => {
  const [api, setApi] = useState<ApiPromise | undefined>(undefined);
  const [injector, setInjector] = useState<InjectedExtension | undefined>(
    undefined
  );
  const [allAccounts, setAllAccounts] = useState<InjectedAccount[]>([]);
  const [extensionEnabled, setExtensionEnabled] = useState<boolean>(false);
  const [nfts, setNfts] = useState<any[]>([]);
  const [recvOffer, setRecvOffer] = useState<any[]>([]);
  const [issuedOffer, setIssuedOffer] = useState<any[]>([]);
  const [pending, setPending] = useState<boolean>(false);

  const initConnection = async () => {
    try {
      const provider = new WsProvider(RPC_URL);
      const _api = await ApiPromise.create({ provider, types: {} });
      const extensions = await web3Enable("nft swap");

      if (extensions.length === 0) {
        alert("请安装 Polkadot.js 扩展！");
        return;
      }
      const curAllAccounts = await fetchAccounts(extensions);
      setAllAccounts(curAllAccounts);
      localStorage.setItem("connectedAccount", curAllAccounts[0].address);
      localStorage.setItem("allAccounts", JSON.stringify(curAllAccounts));

      const _injector = await web3FromAddress(curAllAccounts[0].address);
      setInjector(_injector);
      setExtensionEnabled(true);

      console.log("API initialized:", _api);
      setApi(_api); // 更新 api 状态
      return _api; // 返回新创建的 API 实例
    } catch (error) {
      console.error("Failed to initialize connection:", error);
    }
  };
  // Handle account retrieval
  const fetchAccounts = async (
    extensions: any[]
  ): Promise<InjectedAccount[]> => {
    const keyring = new Keyring({ type: "sr25519" });
    if (extensions.length === 0) {
      return [keyring.addFromUri("//Alice")];
    } else {
      const allAcc = await web3Accounts();
      setAllAccounts(allAcc);
      return allAcc.length > 0 ? allAcc : [keyring.addFromUri("//Alice")];
    }
  };
  useEffect(() => {
    const connectAndFetchAccounts = async () => {
      console.log("刷新页面");
      const connectedAccount = localStorage.getItem("connectedAccount");
      console.log("当前的 api 状态:", api);

      if (connectedAccount && !api) {
        console.log("检测到连接账户信息，准备初始化连接...");
        const _api = await initConnection(); // 初始化连接
        if (_api) {
          console.log("连接成功，获取账户信息");
          const allCs = localStorage.getItem("allAccounts");
          const _injector = await web3FromAddress(connectedAccount);
          if (allCs) {
            console.log("allAccounts", JSON.parse(allCs));
            setInjector(_injector);
            setAllAccounts(JSON.parse(allCs)); // 更新账户信息
            setExtensionEnabled(true);
          } else {
            console.log("未检测到 allAccounts 数据");
          }
        }
      }
    };

    connectAndFetchAccounts(); // 调用异步函数执行连接逻辑
  }, [api]);
  const value = {
    api,
    setApi,
    injector,
    setInjector,
    allAccounts,
    setAllAccounts,
    extensionEnabled,
    setExtensionEnabled,
    nfts,
    setNfts,
    recvOffer,
    setRecvOffer,
    issuedOffer,
    setIssuedOffer,
    initConnection,
    pending,
    setPending,
  };

  return (
    <SubstrateContext.Provider value={value}>
      {children}
    </SubstrateContext.Provider>
  );
};

export const useSubstrateContext = (): SubstrateContextProps => {
  const context = React.useContext(SubstrateContext);
  if (!context) {
    throw new Error(
      "useSubstrateContext must be used within a SubstrateProvider"
    );
  }
  return context;
};

export const useAccount = (): InjectedAccount | null => {
  const { allAccounts } = useSubstrateContext();
  return allAccounts.length > 0 ? allAccounts[0] : null;
};
