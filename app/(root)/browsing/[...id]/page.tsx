"use client";
import { GlareCard } from "@/components/ui/glare-card";
import { LampContainer } from "@/components/ui/lamp";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Boxes } from "@/components/ui/background-boxes";
import { BackgroundGradient } from "@/components/ui/background-gradient";
// 定义 NFT 数据的类型

const NftDetailPage = () => {
  const router = useRouter();
  const [nftData, setNftData] = useState<any>();
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
    <div className="relative  h-[100vh] w-[100%]">
      <button
        className="absolute top-[50px] left-[50px] bg-white text-center w-32 rounded-2xl h-10 relative text-black text-sm font-semibold group"
        type="button"
        onClick={() => {
          router.push("/browsing");
        }}
      >
        <div className="bg-purple-200 rounded-xl h-8 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[120px] z-10 duration-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 1024"
            height="25px"
            width="25px"
          >
            <path
              d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
              fill="#000000"
            ></path>
            <path
              d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
              fill="#000000"
            ></path>
          </svg>
        </div>
        <p className="translate-x-2">Go Back</p>
      </button>{" "}
      <div className="flex justify-center  items-center h-full w-full">
        <BackgroundGradient className="rounded-[30px] max-w-sm p-1 sm:p-2 bg-white dark:bg-zinc-900">
          {nftData && (
            <GlareCard className="z-30">
              <div className="w-full h-[60%]">
                <img
                  src={nftData.url}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <p className="pl-3 text-purple-200 font-bold text-xl mt-4 align-middle">
                {nftData.name}
              </p>
              {nftData.id ? (
                <p className="pl-3 text-white  font-bold text-sm mt-3">
                  {nftData.id.slice(0, 6)}...{nftData.id.slice(-4)}
                </p>
              ) : (
                <p className="pl-3 text-white  font-bold text-sm mt-3">
                  {nftData.nft[0].slice(0, 6)}...{nftData.nft[0].slice(-4)}
                </p>
              )}
              {nftData.id ? (
                <p className="pl-3 text-red-300  font-bold text-sm mt-2">
                  IDX : {nftData.idx}
                </p>
              ) : (
                <p className="pl-3 text-red-300  font-bold text-sm mt-2">
                  IDX : {nftData.nft[1]}
                </p>
              )}

              <p className="pl-3 text-white text-sm mt-2 overflow-hidden whitespace-nowrap overflow-ellipsis">
                Desc: {nftData.desc}
              </p>
            </GlareCard>
          )}
        </BackgroundGradient>{" "}
      </div>
    </div>
  );
};

export default NftDetailPage;
