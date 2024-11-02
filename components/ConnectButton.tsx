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
import { TbReload } from "react-icons/tb";
import Image from "next/image";
import Link from "next/link";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { useToast } from "@/hooks/use-toast";
import { FaRegCircleCheck } from "react-icons/fa6";

const RPC_URL = "ws://127.0.0.1:9944";

const ConnectButton = () => {
  // State management
  const [active, setActive] = useState<string | null>(null);
  const [accountBal, setAccountBal] = useState<any>(0);
  const [accountAddr, setAccountAddr] = useState<string>("");
  const [buttonText, setButtonText] = useState<string>("Connect");
  const [isConnect, setIsConnect] = useState<boolean>(false);
  const [faucet, setfaucet] = useState<boolean>(false);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const {
    api,
    setApi,
    setInjector,
    allAccounts,
    setAllAccounts,
    setExtensionEnabled,
    initConnection,
    pending,
  } = useSubstrateContext();
  const { toast } = useToast();

  // 在组件加载时检查
  useEffect(() => {
    const init = async () => {
      const savedAccount = localStorage.getItem("connectedAccount");

      if (savedAccount) {
        setAccountAddr(savedAccount);
        setButtonText("Disconnect");
        setIsConnect(true);

        const _api = await initConnection();
        const extensions = await web3Enable("nft swap");
        const _injector = await web3FromAddress(savedAccount);
        setInjector(_injector);
        setExtensionEnabled(true);
        // console.log("injector!!!");

        // 获取alice的余额
        const bal = await fetchBalance(savedAccount);
        setAccountBal(bal);
      }
    };
    init();
  }, []);
  useEffect(() => {
    const updateBalance = async () => {
      if (allAccounts.length > 0 && api) {
        const bal = await fetchBalance(allAccounts[0].address);
        setAccountBal(bal);
      }
    };
    updateBalance();
  }, [allAccounts, faucet]);
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

  // Handle account balance retrieval
  const fetchBalance = async (account: string): Promise<any> => {
    if (!api) return "";
    const accountInfo: any = await api.query.system.account(account);
    let bal = accountInfo.data.free.toString();
    console.log("accountInfo,", Number(bal) / 10 ** 12);
    setfaucet(!faucet);
    return Number(bal) / 10 ** 12;
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

      const bal = await fetchBalance(curAllAccounts[0].address);
      setApi(_api);
      setAllAccounts(curAllAccounts);
      setButtonText("Disconnect");
      setIsConnect(true);
      setAccountBal(bal);
      setAccountAddr(curAllAccounts[0].address);
      setDropdownVisible(true);

      const _injector = await web3FromAddress(curAllAccounts[0].address);
      setInjector(_injector);
      setExtensionEnabled(true);

      localStorage.setItem("connectedAccount", curAllAccounts[0].address);
      localStorage.setItem("allAccounts", JSON.stringify(curAllAccounts));
    }
  };
  const handleDisConnect = () => {
    setAllAccounts([]);
    setApi(undefined);
    setButtonText("Connect");
    setIsConnect(false);
    setAccountBal(0);
    setAccountAddr("");
    setDropdownVisible(false);
    // 删除连接的账户信息
    localStorage.removeItem("connectedAccount");
    localStorage.removeItem("allAccounts");
  };
  // Shorten account address
  const displayAddress = (address: string) => {
    return address ? (
      <>
        {/* <span className="text-purple-200">Add:</span> */}
        {address.slice(0, 6)}...{address.slice(-4)}
      </>
    ) : (
      ""
    );
  };
  const handleFaucet = async () => {
    // alice给账号转账
    if (allAccounts.length > 0 && api) {
      const keyring = new Keyring({ type: "sr25519" });
      const alice = keyring.addFromUri("//Alice");
      const tx = api.tx.balances.transferKeepAlive(
        allAccounts[0].address,
        0.1 * 10 ** 12
      );
      // const hash = await tx.signAndSend(alice);
      // console.log(`transfer hash ${hash.toHex()}`);
      const unsubscribe = await tx.signAndSend(alice, ({ status }) => {
        if (status.isInBlock || status.isFinalized) {
          console.log(`Transaction included at blockHash ${status.asInBlock}`);

          // 交易完成后再获取余额
          fetchBalance(allAccounts[0].address);

          // 停止监听交易
          unsubscribe();
        }
      });
      toast({
        title: (
          <div className="flex items-center">
            <FaRegCircleCheck
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            Fauset 0.1 SNS !
          </div>
        ) as unknown as string,
        // description: hash.toHex(),
        variant: "success",
      });
      // 重新获取余额
      // const bal = await fetchBalance(allAccounts[0].address);
      // console.log("点击之后的： ", bal);
      // setAccountBal(Number(bal) / 10 ** 12); // 更新余额
      // setfaucet(!faucet);
    }
  };

  return (
    <div>
      {pending ? (
        <div
          // className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
          className="flex cursor-pointer shadow-[0_0_0_3px_#000000_inset] bg-transparent border border-black dark:border-white dark:text-white text-black rounded-2xl font-bold transform hover:-translate-y-1 transition duration-400 px-6 py-2"
        >
          <Image
            className="rotating"
            src={`/images/loading.png`}
            alt=""
            layout="responsive"
            width="28"
            height="28"
          />{" "}
          Pending
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <div className="relative group hover:scale-110 transition-transform duration-300 cursor-pointer">
            <Image
              src={`/images/faucet.png`}
              alt="faucet"
              width={30}
              height={30}
              // style={{ width: '30px', height: '30px' }}
              onClick={handleFaucet}
            />
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2  text-white text-center text-sm rounded p-2 bg-black/50 shadow-inner opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              faucet
            </div>
          </div>
          {accountBal != 0 && (
            <div className="px-2 text-sm text-purple-200">
              {accountBal.toFixed(4)} SNS
            </div>
          )}
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
                <HoveredLi>
                  <Link href="/userCenter">User Center</Link>
                </HoveredLi>
                <HoveredLi onClick={() => handleDisConnect()}>
                  <span className="text-red-400 hover:font-semibold ">
                    Disconnect
                  </span>{" "}
                </HoveredLi>
              </div>
            </MenuItem>
          </Menu>
        </div>
      )}
    </div>
  );
};

export default ConnectButton;
