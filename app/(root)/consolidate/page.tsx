"use client";
import Image from "next/image";
import { Tabs } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/check-box";
import { useEffect, useState } from "react";
import { useSubstrateContext } from "@/app/SubstrateProvider";

const nftData = [
  {
    id: 1,
    title: "Digital Sunrise",
    imageUrl: "https://app.nftmart.io/static/media/007.16d68919.png",
    description: "A beautiful digital sunrise artwork.",
    creator: "Artist A",
    price: "0.5 ETH",
  },
  {
    id: 2,
    title: "Abstract Dream",
    imageUrl: "https://app.nftmart.io/static/media/007.16d68919.png",
    description: "An abstract piece that captures the essence of dreams.",
    creator: "Artist B",
    price: "1.2 ETH",
  },
  {
    id: 3,
    title: "Ocean Waves",
    imageUrl: "https://app.nftmart.io/static/media/007.16d68919.png",
    description: "A stunning representation of ocean waves.",
    creator: "Artist C",
    price: "0.8 ETH",
  },
];

const Consolidate = () => {
  const [mergeBtn, setmergeBtn] = useState(false);
  const [datas, setdatas] = useState([]);
  const { api, allAccounts, injector, extensionEnabled, setPending } =
    useSubstrateContext();

  useEffect(() => {
    console.log("mergeBtn", mergeBtn);
  }, [mergeBtn, setmergeBtn]);
  useEffect(() => {
    const fetchCollectionIds = async () => {
      if (!api) return; // 如果 api 尚未初始化，直接返回

      try {
        const connectedAccount = localStorage.getItem("connectedAccount");
        console.log(connectedAccount);
        const nfts = await api.query.nftModule.ownedNFTs(connectedAccount);
        const datas = JSON.parse(nfts);
        console.log("datas", datas);
        setdatas(datas);
      } catch (error) {
        console.error("Error fetching collection IDs:", error);
      }
    };

    fetchCollectionIds();
  }, [api]); // 添加 api 作为依赖项
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden sm:px-10 px-5">
      <Header />

      <div className="max-w-[80%] w-full relative  flex flex-col my-20  items-start justify-start">
        <div className="absolute left-0 z-20 flex max-w-sm items-center space-x-2">
          <Input className="w-[200px]" />
          <button className="px-4 py-2 rounded-md border border-white-300 uppercase bg-white text-black text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md">
            Search
          </button>
          <button
            onClick={() => setmergeBtn(!mergeBtn)}
            className="px-4 py-2 rounded-md border border-3 border-white uppercase  text-white text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md"
          >
            merge
          </button>
          <button className="px-4 py-2 rounded-md border border-3 border-white uppercase  text-white text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md">
            Split
          </button>
        </div>
        <div className="mt-40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* 遍历 Art 类别下的 NFT */}
          {datas.map((item, idx) => (
            <DummyContent key={item.id} item={item} idx={idx} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Consolidate;

// 定义 DummyContent 组件的 props 类型
type DummyContentProps = {
  item: string[];
  idx: string;
};
const DummyContent: React.FC<DummyContentProps> = ({ item, idx }) => {
  console.log(item);
  return (
    <div className="cursor-pointer bg-white shadow-md rounded-t-lg rounded-b-md p-4 w-full max-w-sm mx-auto">
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
        <Image
          src="https://app.nftmart.io/static/media/007.16d68919.png"
          alt=""
          width={100}
          height={100}
          className="h-full w-full object-cover rounded-t-lg"
        />
      </div>
      {/* NFT Info */}
      <div className="mt-4 text-center">
        <h3 className="text-xl text-black-100 font-semibold">
          {item[0].slice(0, 6)}...{item[0].slice(-4)}
        </h3>
        <p className="text-sm text-gray-500">{idx}</p>
        <p className="text-lg font-bold text-pink-500 mt-2">{item[2]}%</p>
      </div>
    </div>
  );
};
