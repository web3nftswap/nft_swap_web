/*
 * @Descripttion:
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-10-11 17:01:06
 * @LastEditors: Hesin
 * @LastEditTime: 2024-10-19 10:13:09
 */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Tabs } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/check-box";
import { useSubstrateContext } from "@/app/SubstrateProvider";
import { hexCodeToString } from "@/utils/util";
import { IoIosArrowDown } from "react-icons/io";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { sendAndWait } from "@/utils/sendAndWait";
const PAGE_SIZE = 15; // 每次加载的数据量

const nftData = [
  {
    category: "Art",
    items: [
      {
        id: 1,
        title: "Digital Sunrise",
        imageUrl: "https://via.placeholder.com/150",
        description: "A beautiful digital sunrise artwork.",
        creator: "Artist A",
        price: "0.5 ETH",
      },
      {
        id: 2,
        title: "Abstract Dream",
        imageUrl: "https://via.placeholder.com/150",
        description: "An abstract piece that captures the essence of dreams.",
        creator: "Artist B",
        price: "1.2 ETH",
      },
      {
        id: 3,
        title: "Ocean Waves",
        imageUrl: "https://via.placeholder.com/150",
        description: "A stunning representation of ocean waves.",
        creator: "Artist C",
        price: "0.8 ETH",
      },
    ],
  },
  {
    category: "Collectibles",
    items: [
      {
        id: 4,
        title: "Rare Coin",
        imageUrl: "https://via.placeholder.com/150",
        description: "A rare collectible coin with historical significance.",
        creator: "Collector A",
        price: "2.0 ETH",
      },
      {
        id: 5,
        title: "Vintage Stamp",
        imageUrl: "https://via.placeholder.com/150",
        description: "A vintage stamp from the early 20th century.",
        creator: "Collector B",
        price: "1.5 ETH",
      },
      {
        id: 6,
        title: "Antique Toy",
        imageUrl: "https://via.placeholder.com/150",
        description: "An antique toy that brings nostalgia.",
        creator: "Collector C",
        price: "3.0 ETH",
      },
    ],
  },
];
interface NFTDataProp {
  id: string | number; // 可能是 string 或 number 类型
  idx: number; // 索引，number 类型
  name: string; // 名称，string 类型
  url: string; // URL，string 类型
  desc: string; // 描述，string 类型
  owners: string[]; // owners 是一个字符串数组
}

interface BuyNFTDataProp {
  nft: string[]; // 可能是 string 或 number 类型
  price: number; // 索引，number 类型
  seller: string; // 名称，string 类型
}

const Browsing = () => {
  const [allDatas, setAllDatas] = useState<NFTDataProp[]>([]);
  const [visibleDatas, setVisibleDatas] = useState<NFTDataProp[]>([]); //All data
  const [buyDatas, setbuyAllDatas] = useState<BuyNFTDataProp[]>([]);
  const [visibleBuyDatas, setVisibleBuyDatas] = useState<BuyNFTDataProp[]>([]);
  const [tabs, settabs] = useState([] as any);
  const { toast } = useToast();

  const { api, allAccounts, injector, extensionEnabled, pending, setPending } =
    useSubstrateContext();

  useEffect(() => {
    fetchAllNfts();
    fetchBuyNfts();
  }, [api]); // 添加 api 作为依赖项

  const fetchBuyNfts = async () => {
    if (!api) return; //
    // 查询所有BuyNFTs
    try {
      const entries = await api.query.nftMarketModule.listings.entries();
      const buyNFTs = entries.map(([key, value]) => ({
        nft: JSON.parse(JSON.stringify(key.args[0])),
        seller: JSON.parse(JSON.stringify(key.args[1])),
        price: JSON.parse(JSON.stringify(value)).price,
      }));
      console.log("buyNFTs", buyNFTs);
      let newBuydatas = [];
      for (let i = 0; i < buyNFTs.length; i++) {
        let owners = await api.query.nftModule.nftOwners([
          buyNFTs[i].nft[0],
          buyNFTs[i].nft[1],
        ]);
        const nft = {
          ...buyNFTs[i],
          owners: JSON.parse(JSON.stringify(owners)),
        };
        console.log(nft);
        newBuydatas.push(nft);
      }
      console.log("newBuydatas", newBuydatas);
      // 获取每个nft的拥有者
      setbuyAllDatas(newBuydatas);
      setVisibleBuyDatas(newBuydatas.slice(0, PAGE_SIZE)); // 初始化可见数据
    } catch (error) {
      console.error("Error fetching collection IDs:", error);
    }
  };
  const fetchAllNfts = async () => {
    if (!api) return; // 如果 api 尚未初始化，直接返回
    // 查询所有NFTs
    try {
      const collectionIds = await api.query.nftModule.nftCollectionIds();
      getAllNfts(collectionIds);
    } catch (error) {
      console.error("Error fetching collection IDs:", error);
    }
  };
  const getAllNfts = async (collectionIds) => {
    // 获取所有的集合
    const collectionIdsArray = JSON.parse(JSON.stringify(collectionIds));
    let datas = [];
    // console.log("collectionIdsArray", collectionIdsArray);
    if (collectionIdsArray && collectionIdsArray.length > 0) {
      for (let i = 0; i < collectionIdsArray.length; ++i) {
        // 获取每一个集合的信息
        const collectionInfo = await api.query.nftModule.nftCollections(
          collectionIdsArray[i]
        );
        const [maxItem, curIndex, metainfo] = JSON.parse(
          JSON.stringify(collectionInfo)
        );
        const collectionMetaInfo = JSON.parse(
          hexCodeToString(metainfo).slice(1)
        );

        for (let j = 0; j < curIndex; ++j) {
          // 获取集合中每个nft的拥有者
          let owners = await api.query.nftModule.nftOwners([
            collectionIdsArray[i],
            j,
          ]);
          // console.log(`nft ${j} owner: ${owners}`);
          const NFTData = {
            id: collectionIdsArray[i],
            // maxItem,
            // curIndex,
            idx: j,
            name: collectionMetaInfo.name,
            url: collectionMetaInfo.url,
            desc: collectionMetaInfo.desc,
            owners: JSON.parse(JSON.stringify(owners)),
          };
          datas.push(NFTData);
        }
      }
    }
    // console.log(datas);
    setAllDatas(datas);
    setVisibleDatas(datas.slice(0, PAGE_SIZE)); // 初始化可见数据
  };
  const loadMoreData = () => {
    console.log("loadMoreData");
    const currentVisibleCount = visibleDatas.length;
    if (currentVisibleCount >= allDatas.length) return;
    const nextDataCount = Math.min(
      PAGE_SIZE,
      allDatas.length - currentVisibleCount
    );
    const nextData = allDatas.slice(
      currentVisibleCount,
      currentVisibleCount + nextDataCount
    );
    setVisibleDatas((prev) => [...prev, ...nextData]);
  };
  const handleBuy = async (info) => {
    console.log("买了买了", info);
    try {
      console.log("pending", pending);
      setPending(true);
      console.log(info.nft, info.seller);
      const tx = api.tx.nftMarketModule.buyNft(info.nft, info.seller);
      const connectedAccount = localStorage.getItem("connectedAccount");
      const hash = await sendAndWait(
        api,
        tx,
        connectedAccount,
        extensionEnabled,
        injector
      );
      console.log(`buy hash: ${hash.toHex()}`);
      toast({
        title: (
          <div className="flex items-center">
            <FaRegCircleCheck
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            Create Successful !!
          </div>
        ),
        variant: "success",
      });

      fetchAllNfts();
      fetchBuyNfts();
    } catch (error) {
      console.log(`create error: ${error}`);
      toast({
        title: <div className="flex items-center">{error}</div>,
        // description: "Fail",
        variant: "destructive",
      });
    } finally {
      console.log("pending", pending);
      setPending(false);
    }
  };

  useEffect(() => {
    console.log("tabs");
    const tabs = [
      {
        title: "All",
        value: "All",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* 遍历所有类别下的 NFT */}
            {visibleDatas.map((itm) => (
              <DummyContent key={`${itm.id}-${itm.idx}`} data={itm} {...itm} />
            ))}
          </div>
        ),
      },
      {
        title: "Buy",
        value: "Buy",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* 遍历 Art 类别下的 NFT */}
            {visibleBuyDatas.map((itm) => (
              <DummyContenBuy
                key={`${itm.nft[0]}-${itm.nft[1]}`}
                data={itm}
                handleBuy={handleBuy}
                {...itm}
              />
            ))}
          </div>
        ),
      },
    ];
    settabs(tabs);
  }, [visibleDatas, allDatas, visibleBuyDatas, buyDatas]);

  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden sm:px-10 px-5">
      <Header />

      <div className="max-w-[80%] w-full">
        <div className="h-[20rem] md:h-[40rem] [perspective:1000px] relative b flex flex-col max-w-5xl mx-auto w-full  items-start justify-start my-40">
          <div className="w-15 absolute right-0 z-20 custom-top flex max-w-sm items-center space-x-2 ">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Own
              </label>
            </div>
            <Input />
            <button className="px-4 py-2 rounded-md border border-white-300 uppercase bg-white text-black text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md">
              Search
            </button>
          </div>
          {tabs.length > 0 && <Tabs tabs={tabs} />}
          {visibleDatas.length < allDatas.length && allDatas.length > 0 && (
            // <button
            //   className="z-40 w-full p-2 bg-blue-500 text-white rounded cursor-pointer"
            // >
            //   Load More
            // </button>
            <div className="w-full flex justify-center">
              <button
                onClick={loadMoreData}
                className="relative w-30 h-10 bg-black text-white flex flex-col items-center justify-center border-none rounded-lg cursor-pointer p-3 gap-3 group"
              >
                <span className="w-full flex justify-center  items-center">
                  Load More
                  <IoIosArrowDown
                    size={20}
                    style={{ fill: "white", paddingTop: "2px" }}
                  />
                </span>
                <span className="absolute inset-0 left-[-4px] top-[-1px] m-auto w-[128px] h-[48px] rounded-[10px] bg-gradient-to-r from-[#e81cff] to-[#40c9ff] z-[-10] transition-all duration-600 ease-[cubic-bezier(0.175, 0.885, 0.32, 1.275)] group-hover:rotate-animation"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#fc00ff] to-[#00dbde] z-[-1] transition-all duration-300 transform scale-[0.95] blur-[20px] group-hover:blur-[30px]"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#fc00ff] to-[#00dbde] z-[-1] transition-all duration-300 transform scale-95 blur-20 group-active:scale-animation"></span>
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default Browsing;

// 定义 DummyContent 组件的 props 类型
// type DummyContentProps = {
//   title: string;
//   creator: string;
//   price: string; // 价格可以是字符串或数字，取决于你的需求
// };
const DummyContent: React.FC<NFTDataProp> = ({
  data,
  id,
  idx,
  name,
  url,
  desc,
  owners,
}) => {
  return (
    <div className="cursor-pointer bg-white shadow-md rounded-t-lg rounded-b-md p-4 w-full max-w-sm mx-auto">
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
        <Image
          src={url}
          alt="dummy image"
          width={100}
          height={100}
          className="h-full w-full object-cover rounded-t-lg"
        />
      </div>
      {/* NFT Info */}
      <div className="mt-4 text-center">
        <h3 className="text-xl text-black-100 font-semibold">{name}</h3>
        <p className="text-sm text-gray-500">idx：{idx}</p>
        {/* <p className="text-lg font-bold text-pink-500 mt-2">{desc}</p> */}
      </div>
      <Link href={`/browsing/${id}/${idx}?data=${data}`}>
        <p className="cursor-pointer text-sm text-gray-500">详情</p>
      </Link>
    </div>
  );
};
const DummyContenBuy: React.FC<BuyNFTDataProp> = ({
  data,
  nft,
  price,
  seller,
  owners,
  handleBuy,
}) => {
  const currentAddress = localStorage.getItem("connectedAccount");
  return (
    <div className="cursor-pointer bg-white shadow-md rounded-t-lg rounded-b-md p-4 pb-2  w-full max-w-sm mx-auto">
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
        {/* <Image
          src={url}
          alt="dummy image"
          width={100}
          height={100}
          className="h-full w-full object-cover rounded-t-lg"
        /> */}
      </div>
      {/* NFT Info */}
      <div className="mt-4 text-center">
        <h3 className="text-xl text-black-100 font-semibold">
          {nft[0].slice(0, 6)}...{nft[0].slice(-4)}
        </h3>
        <p className="text-sm text-gray-500">idx：{nft[1]}</p>
        <p className="text-md text-pink-500 mt-2">share: {nft[2]}%</p>
        <p className="text-lg font-bold text-pink-500 mt-2">$ {price}</p>
        <div className="text-sm text-gray-500 py-2 ">
          <AnimatedTooltip
            items={[{ name: "See Owners", designation: owners.join("\n") }]}
          />
        </div>
      </div>
      {owners.includes(currentAddress) ? (
        ""
      ) : (
        <div className="flex justify-between pt-2 -mx-2">
          <Button
            variant="secondary"
            onClick={() => {
              handleBuy({ nft: nft, seller });
            }}
          >
            Buy
          </Button>

          <Button variant="outline">Swap</Button>
        </div>
      )}
    </div>
  );
};
