"use client";

import React, { createContext, useState, ReactNode } from "react";
import { ApiPromise } from "@polkadot/api";
import {
  InjectedExtension,
  InjectedAccount,
} from "@polkadot/extension-inject/types";

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
  nfts: any[]; // 可以根据需要调整类型
  setNfts: React.Dispatch<React.SetStateAction<any[]>>;
  recvOffer: any[]; // 可以根据需要调整类型
  setRecvOffer: React.Dispatch<React.SetStateAction<any[]>>;
  issuedOffer: any[]; // 可以根据需要调整类型
  setIssuedOffer: React.Dispatch<React.SetStateAction<any[]>>;
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
