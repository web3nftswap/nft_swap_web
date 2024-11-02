"use client";
import { GlareCard } from "@/components/ui/glare-card";
import { LampContainer } from "@/components/ui/lamp";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Boxes } from "@/components/ui/background-boxes";
// 定义 NFT 数据的类型
interface NftData {
  id: string;
  name: string;
  idx: string;
  url: string;
  desc: string;
}

const NftDetailPage = () => {
  const router = useRouter();
  const [nftData, setNftData] = useState<NftData>();
  useEffect(() => {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);

    const data = params.get("data");
    if (data) {
      const parsedData = JSON.parse(decodeURIComponent(data));
      console.log(parsedData);
      setNftData(parsedData);
    }
  }, []);

  return (
    <div className="flex justify-center  items-center h-[100vh]">
      {/* <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" /> */}
      {/* <Boxes /> */}
      {nftData && (
        <GlareCard className="z-30">
          <div className="w-full h-[60%]">
            {/* <Image
              src={nftData.url}
              alt="image"
              width={0}
              height={0}
              layout="responsive"
              style={{ width: "100%", height: "100%" }}
            /> */}
            <img src={nftData.url} style={{ width: "100%", height: "100%" }} />
          </div>
          <p className="pl-3 text-purple-200 font-bold text-xl mt-4 align-middle">
            {nftData.name}
          </p>
          <p className="pl-3 text-white  font-bold text-sm mt-3">
            {nftData.id.slice(0, 6)}...{nftData.id.slice(-4)}
          </p>
          <p className="pl-3 text-red-300  font-bold text-sm mt-2">IDX : {nftData.idx}</p>
          <p className="pl-3 text-white text-sm mt-2 overflow-hidden whitespace-nowrap overflow-ellipsis">
            Desc: {nftData.desc}
          </p>
        </GlareCard>
      )}
    </div>
  );
};

export default NftDetailPage;
