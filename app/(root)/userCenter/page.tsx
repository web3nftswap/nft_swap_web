"use client";
import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useSubstrateContext } from "@/app/SubstrateProvider";
import { useToast } from "@/hooks/use-toast";
import { sendAndWait } from "@/utils/sendAndWait";
import { hexCodeToString } from "@/utils/util";

//COMPONENTS
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet-box";

//ICON
import { BiSolidMessageSquareDetail } from "react-icons/bi";
import { RiErrorWarningLine } from "react-icons/ri";
import { FaRegCircleCheck } from "react-icons/fa6";

const UserCenter = () => {
  const [open, setOpen] = useState(false); //sheet open
  const [datas, setdatas] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [pubItem, setpubItem] = useState([] as any); //Publish ITEM
  const [offerCounts, setofferCounts] = useState(0);
  const [sentofferCounts, setsentofferCounts] = useState(0);
  const [offerList, setofferList] = useState([]); //receive offer list
  const [sentOfferList, setsentOfferList] = useState([]); //check send offer list
  const [isSheetOpen, setIsSheetOpen] = useState(false); // offer
  const [isSheetOpen1, setIsSheetOpen1] = useState(false); //check offer
  const [shareMes, setshareMes] = useState(0);
  const [shareVal, setshareVal] = useState(0);
  const [priceVal, setpriceVal] = useState(0);
  const { toast } = useToast();
  const { api, allAccounts, injector, extensionEnabled, pending, setPending } =
    useSubstrateContext();

  useEffect(() => {
    fetchUserNFTs();
  }, [api]);

  const fetchUserNFTs = async () => {
    if (!api) return; // 如果 api 尚未初始化，直接返回

    try {
      // console.log("[Query] ownedNFTs");
      const connectedAccount = localStorage.getItem("connectedAccount");

      // 当前账号的上架 list
      const entries = await api.query.nftMarketModule.listings.entries();
      const publishedNFTs = entries
        .filter(([key]) => key.args[1].eq(connectedAccount))
        .map(([key, value]) => ({
          nft: JSON.parse(JSON.stringify(key.args[0])),
          seller: JSON.parse(JSON.stringify(key.args[1])),
          price: JSON.parse(JSON.stringify(value)).price,
        }));
      // console.log("publishedNFTs", publishedNFTs);

      const ownedNFTs: any = await api.query.nftModule.ownedNFTs(
        connectedAccount
      );
      const datas = JSON.parse(ownedNFTs);
      // console.log("ownedNFTs", datas);

      // 当前账号的上架 list
      const ownedNFTsArray: any = await Promise.all(
        datas.map(async (i: any) => {
          let status = await getNftConsolidateStatus(i[0], i[1]);
          // 检查 publishedNFTs 中是否存在匹配的对象
          const matchingItem = publishedNFTs.find(
            (item) => item.nft[0] === i[0] && item.nft[1] === i[1]
          );
          // console.log("是否上架", matchingItem);
          // 获取每一个集合的信息
          const nftInfo = await api.query.nftModule.nftCollections(i[0]);
          const [maxItem, curIndex, metainfo] = JSON.parse(
            JSON.stringify(nftInfo)
          );
          const nftMetaInfo = JSON.parse(hexCodeToString(metainfo).slice(1));
          // // console.log("nftMetaInfo", nftMetaInfo);
          return {
            nft: i,
            url: nftMetaInfo.url,
            name: nftMetaInfo.name,
            desc: nftMetaInfo.desc,
            status: status,
            ...(matchingItem
              ? { price: matchingItem.price, share: matchingItem.nft[2] }
              : {}),
          };
        })
      );
      // console.log("Fetched Data:", ownedNFTsArray);
      setdatas(ownedNFTsArray);
    } catch (error) {
      console.error("Error fetching collection IDs:", error);
    }

    // get All offer
    fetchAllOfferList();

    //get Sent offer
    fetchSentList();
  };
  const fetchSentList = async () => {
    // console.log("[Query] all sent offers");
    // 发送的所有offer
    const connectedAccount = localStorage.getItem("connectedAccount");
    const offerList = await getAccountAllSentOffers(api, connectedAccount);
    setsentofferCounts(offerList.length);
    setsentOfferList(offerList);

    // console.log(allSentOffers);
  };

  const fetchAllOfferList = async () => {
    // console.log("[Query] alice offers");
    // 收到的所有offer
    const connectedAccount = localStorage.getItem("connectedAccount");

    const allOffersList = await getAccountAllOffers(api, connectedAccount);
    // console.log("收到的所有offer", offersList);
    setofferList(allOffersList);
    setofferCounts(allOffersList.length);
  };

  const getAccountAllOffers = async (api: any, accountAddress: any) => {
    const entries = await api.query.nftMarketModule.offers.entries();
    const offersForAccount: any = [];
    for (const [key, value] of entries) {
      if (
        key.args[1].eq(accountAddress) &&
        JSON.parse(JSON.stringify(value)).length
      ) {
        // 集合info
        const nftMetaInfo = await getInfo(
          JSON.parse(JSON.stringify(key.args[0]))[0]
        );
        const offersNFT = JSON.parse(JSON.stringify(value));
        // console.log("getAccountAllOffers", offersNFT);
        let newoffersNFT: any = [];

        for (let i = 0; i < offersNFT.length; i++) {
          let offeredNftsInfo: any = [];

          const targetArr = offersNFT[i].offeredNfts;

          // console.log(targetArr[i]);
          for (let j = 0; j < targetArr.length; j++) {
            // console.log("targetArr[j]", targetArr[j]);
            // console.log("targetArr[j][0]", targetArr[j][0]);
            // 集合info
            const eachOfferInfo = await getInfo(targetArr[j][0]);
            // console.log("each offer info", eachOfferInfo);
            offeredNftsInfo.push({
              url: eachOfferInfo.url,
              name: eachOfferInfo.name,
              desc: eachOfferInfo.desc,
            });
          }
          newoffersNFT.push({
            ...offersNFT[i],
            offeredNftsInfo,
          });
        }
        console.log("newoffersNFT", newoffersNFT);
        offersForAccount.push({
          nft: JSON.parse(JSON.stringify(key.args[0])),
          offers: newoffersNFT,
          url: nftMetaInfo.url,
          name: nftMetaInfo.name,
        });
      }
    }

    return offersForAccount;
  };
  const getInfo = async (id) => {
    // 获取每一个集合的信息
    const nftInfo = await api?.query.nftModule.nftCollections(id); // 使用 key.args[0] 作为参数
    const [maxItem, curIndex, metainfo] = JSON.parse(JSON.stringify(nftInfo));
    const nftMetaInfo = JSON.parse(hexCodeToString(metainfo).slice(1));
    return nftMetaInfo;
  };
  const getAccountAllSentOffers = async (api: any, accountAddress: any) => {
    const entries = await api.query.nftMarketModule.offers.entries();
    const offersForAlice: any = [];
    for (const [storageKeys, boundedVecOffers] of entries) {
      const offers = boundedVecOffers.toHuman();

      for (const offer of offers) {
        if (offer.buyer === accountAddress) {
          // offersForAlice.push(offer);
          console.log("offer", offer);
          //offer target
          let offeredNftsInfo: any = [];
          const targetArr = offer.offeredNfts;
          for (let j = 0; j < targetArr.length; j++) {
            // info
            const eachOfferInfo = await getInfo(targetArr[j][0]);
            // console.log("each offer info", eachOfferInfo);
            offeredNftsInfo.push({
              url: eachOfferInfo.url,
              name: eachOfferInfo.name,
              desc: eachOfferInfo.desc,
            });
          }
          // console.log("offeredNftsInfo", offeredNftsInfo);
          let offerInfo = {
            nft: JSON.parse(JSON.stringify(storageKeys.args[0])),
            offeredNfts: offer.offeredNfts,
            offeredNftsInfo: offeredNftsInfo,
            tokenAmount: offer.tokenAmount,
            seller: JSON.parse(JSON.stringify(storageKeys.args[1])),
          };
          // console.log("offerInfo", offerInfo.nft[0]);
          const nftMetaInfo = await getInfo(offerInfo.nft[0]);

          offersForAlice.push({
            ...offerInfo,
            name: nftMetaInfo.name,
            url: nftMetaInfo.url,
            desc: nftMetaInfo.desc,
          });
        }
      }
    }
    // console.log("offersForAlice", offersForAlice);

    return offersForAlice;
  };
  const getNftConsolidateStatus = async (
    collectionId: any,
    itemIndex: any
  ): Promise<string> => {
    // console.log("[Query] nftDetails");
    const nftDetails = await api?.query.nftModule.nftDetails([
      collectionId,
      itemIndex,
    ]);
    //// console.log(`nftDetails: ${nftDetails}`);
    const { mergedNft, subNfts, metadata } = JSON.parse(
      JSON.stringify(nftDetails)
    );
    //// console.log(
    //  `mergedNft: ${mergedNft}, subNfts: ${subNfts}, metadata: ${metadata}`
    //);
    let status: string = "";
    if (subNfts.length > 0) {
      status = "merged"; // merge的nft
      // console.log("merged nft");
    } else if (mergedNft == null) {
      status = "general"; // 普通没有merge的nft
      // // console.log("general nft");
    } else {
      status = "sub"; // 该nft已被merge，当前不可用
      // // console.log("sub(frozen) nft");
    }
    return status;
  };

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // console.log(pubItem);

    // console.log("上架");
    const formData = new FormData(event.currentTarget);
    const formDataObject = Object.fromEntries(formData.entries());
    // console.log("表单数据对象:", formDataObject);

    let params: any;
    if (isUpdate) {
      params = {
        nft: pubItem.nft,
        price: Number(priceVal) * 10 ** 12,
      };
    } else {
      const shareRate = Number(formDataObject.share);
      const price = Number(formDataObject.price) * 10 ** 12;
      params = {
        nft: [pubItem.nft[0], Number(pubItem.nft[1]), shareRate],
        price,
      };
    }
    console.log(params);
    // debugger;
    // 上架
    try {
      // console.log("pending", pending);
      setPending(true);
      setOpen(false);
      //当前账户
      const currentAccount = allAccounts[0];
      //tx
      const tx = api?.tx.nftMarketModule.listNft(params.nft, params.price);
      //hash
      const hash = await sendAndWait(
        api,
        tx,
        currentAccount,
        extensionEnabled,
        injector
      );
      // console.log(`publish hash: ${hash.toHex()}`);
      toast({
        title: (
          <div className="flex items-center">
            <FaRegCircleCheck
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            List for sale Successful !!
          </div>
        ) as unknown as string,
        variant: "success",
      });
      //刷新数据 NFT 集合
      fetchUserNFTs();
    } catch (error: any) {
      // console.log(`create error: ${error}`);
      toast({
        title: (
          <div className="flex items-center">{error.message}</div>
        ) as unknown as string,
        // description: "Fail",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };
  const handleUnlist = async (obj: any) => {
    // console.log("unlist", obj);
    try {
      setPending(true);
      const params = [obj.nft[0], obj.nft[1], obj.share];
      let tx = api?.tx.nftMarketModule.unlistNft(params);
      const currentAccount = allAccounts[0];
      let hash: any = await sendAndWait(
        api,
        tx,
        currentAccount,
        extensionEnabled,
        injector
      );
      // console.log(`accept hash: ${hash.toHex()}`);
      toast({
        title: (
          <div className="flex items-center">
            <FaRegCircleCheck
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            Unlist Successful!
          </div>
        ) as unknown as string,
        description: hash.toHex(),
        variant: "success",
      });
      setPending(false);
      //update
      fetchUserNFTs();
    } catch (error: any) {
      // console.log(`accept error: ${error}`);
      setPending(true);
      toast({
        title: (
          <div className="flex items-center">{error}</div>
        ) as unknown as string,
        description: "Fail",
        variant: "destructive",
      });
    } finally {
      setPending(false);
      setIsSheetOpen(false);
    }
  };
  const handleOffer = async (target, idx) => {
    // console.log("[Call] acceptOffer");
    // console.log(target, idx);
    let tx = api?.tx.nftMarketModule.acceptOffer(
      target.nft, // 目标NFT
      target.offers[idx].offeredNfts, // 用于报价的NFT数组
      target.offers[idx].tokenAmount, // 用于报价的token
      target.offers[idx].buyer // 买家
    );
    try {
      setPending(true);
      setIsSheetOpen(false);
      const currentAccount = allAccounts[0];
      let hash: any = await sendAndWait(
        api,
        tx,
        currentAccount,
        extensionEnabled,
        injector
      );
      // console.log(`accept hash: ${hash.toHex()}`);
      toast({
        title: (
          <div className="flex items-center">
            <FaRegCircleCheck
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            Successful!
          </div>
        ) as unknown as string,
        description: hash.toHex(),
        variant: "success",
      });
      // get All offer
      fetchAllOfferList();
      // get all nfts
      fetchUserNFTs()
    } catch (error: any) {
      // console.log(`accept error: ${error}`);
      toast({
        title: (
          <div className="flex items-center">{error}</div>
        ) as unknown as string,
        description: "Fail",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };
  const handleRejectOffer = async (target, idx) => {
    console.log("[Call] rejectOffer");
    let tx = api?.tx.nftMarketModule.rejectOffer(
      target.nft, // 目标NFT
      target.offers[idx].offeredNfts, // 用于报价的NFT数组
      target.offers[idx].tokenAmount, // 用于报价的token
      target.offers[idx].buyer // 买家
    );
    try {
      setPending(true);
      setIsSheetOpen(false);

      const currentAccount = allAccounts[0];
      let hash: any = await sendAndWait(
        api,
        tx,
        currentAccount,
        extensionEnabled,
        injector
      );
      // console.log(`accept hash: ${hash.toHex()}`);
      toast({
        title: (
          <div className="flex items-center">
            <FaRegCircleCheck
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            Reject Offer Successful!
          </div>
        ) as unknown as string,
        description: hash.toHex(),
        variant: "success",
      });
      setPending(false);
      // get All offer
      fetchAllOfferList();
    } catch (error: any) {
      // console.log(`accept error: ${error}`);
      setPending(true);
      toast({
        title: (
          <div className="flex items-center">{error}</div>
        ) as unknown as string,
        description: "Fail",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  const handleCancelOffer = async (target) => {
    console.log("[Call] cancelOffer");
    // console.log(target);
    // console.log(
    //   target.tokenAmount,
    //   Number(target.tokenAmount.replace(/,/g, ""))
    // );
    let tx = api?.tx.nftMarketModule.cancelOffer(
      target.nft, // 目标NFT
      target.offeredNfts, // 用于报价的NFT数组
      Number(target.tokenAmount.replace(/,/g, "")), // 用于报价的token
      target.seller // 卖家
    );
    try {
      setPending(true);
      setIsSheetOpen1(false);
      const currentAccount = allAccounts[0];
      let hash: any = await sendAndWait(
        api,
        tx,
        currentAccount,
        extensionEnabled,
        injector
      );
      // console.log(`accept hash: ${hash.toHex()}`);
      toast({
        title: (
          <div className="flex items-center">
            <FaRegCircleCheck
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            Cancel Offer Successful!
          </div>
        ) as unknown as string,
        description: hash.toHex(),
        variant: "success",
      });
      setPending(false);

      //get Sent offer
      fetchSentList();
    } catch (error: any) {
      // console.log(`accept error: ${error}`);
      setPending(false);
      if (error != "Cancelled")
        toast({
          title: (
            <div className="flex items-center">{error}</div>
          ) as unknown as string,
          description: "Fail",
          variant: "destructive",
        });
    } finally {
      setPending(false);
      setIsSheetOpen1(false);
    }
  };
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden sm:px-10 px-5">
      <Header />
      <div className="max-w-[80%] w-full  relative  flex flex-col mt-40  items-start justify-start">
        <div className="absolute left-0 z-20 flex items-center space-x-2">
          <Button
            className="relative"
            onClick={() => {
              setIsSheetOpen1(true);
            }}
          >
            Sent Offers
            {sentofferCounts ? (
              <div className="absolute inline-flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900"></div>
            ) : (
              ""
            )}
          </Button>

          <Button
            className="relative"
            onClick={() => {
              setIsSheetOpen(true);
            }}
          >
            Received Offers
            {offerCounts ? (
              <div className="absolute inline-flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900"></div>
            ) : (
              ""
            )}
          </Button>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="right" className="w-[80vw] bg-white">
              <SheetHeader>
                <SheetTitle>Offer List</SheetTitle>
                <SheetDescription>confirm offer </SheetDescription>
              </SheetHeader>
              <div
                className="overflow-y-scroll"
                style={{ height: "calc(100vh + 80vh)" }}
              >
                <ul role="list" className="divide-y divide-gray-100">
                  {offerList.map((itm, idx) => (
                    <ListBox
                      item={itm}
                      key={idx}
                      handleOffer={handleOffer}
                      handleRejectOffer={handleRejectOffer}
                    />
                  ))}
                </ul>
              </div>
            </SheetContent>
          </Sheet>
          {/* send offer list */}
          <Sheet open={isSheetOpen1} onOpenChange={setIsSheetOpen1}>
            <SheetContent side="right" className="w-[80vw] bg-white">
              <SheetHeader>
                <SheetTitle>Send Offer List</SheetTitle>
                {/* <SheetDescription>confirm offer </SheetDescription> */}
              </SheetHeader>
              <div
                className="overflow-y-scroll"
                style={{ height: "calc(100vh + 80vh)" }}
              >
                <ul role="list" className="divide-y divide-gray-100">
                  {sentOfferList.map((itm, idx) => (
                    <ListBox1
                      item={itm}
                      key={idx}
                      handleCancelOffer={handleCancelOffer}
                    />
                  ))}
                </ul>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* 遍历 Art 类别下的 NFT */}
          {datas
            .filter((item: any) => item.status !== "sub") // 先过滤掉状态为 "sub" 的项目
            .map((item, idx) => (
              <DummyContent
                key={`${item[0]}-${idx}`}
                item={item}
                nftInfo={(item as { nft: string[] }).nft}
                status={(item as { status: string }).status}
                handlePublish={handlePublish}
                open={open}
                setOpen={setOpen}
                pubItem={pubItem}
                handleUnlist={handleUnlist}
                setpubItem={setpubItem}
                shareMes={shareMes}
                setshareMes={setshareMes}
                shareVal={shareVal}
                setshareVal={setshareVal}
                isUpdate={isUpdate}
                setIsUpdate={setIsUpdate}
                priceVal={priceVal}
                setpriceVal={setpriceVal}
              />
            ))}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default UserCenter;

// 定义 DummyContent 组件的 props 类型
type DummyContentProps = {
  item: any;
  nftInfo: string[];
  status: string;
  handlePublish: (event: FormEvent<HTMLFormElement>) => void;
  handleUnlist: (nft: any) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  pubItem: any;
  setpubItem: (open: boolean) => void;
  shareMes: any;
  setshareMes: (open: number) => void;
  shareVal: any;
  setshareVal: (open: number) => void;
  priceVal: any;
  setpriceVal: (open: number) => void;
  isUpdate: any;
  setIsUpdate: (open: boolean) => void;
};

const DummyContent: React.FC<DummyContentProps> = ({
  item,
  nftInfo,
  handlePublish,
  open,
  setOpen,
  pubItem,
  setpubItem,
  shareMes,
  setshareMes,
  shareVal,
  setshareVal,
  isUpdate,
  setIsUpdate,
  priceVal,
  setpriceVal,
  handleUnlist,
}) => {
  const { toast } = useToast();
  console.log("first", item);
  return (
    <div className=" cursor-pointer relative bg-white shadow-md rounded-t-lg rounded-b-md p-4 pb-2 w-full max-w-sm mx-auto">
      {/* Image Placeholder */}

      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
        <Image
          src={item.url}
          alt={item.name}
          width={100}
          height={100}
          className="h-full w-full object-cover rounded-t-lg"
        />
      </div>

      {/* NFT Info */}
      <div className="mt-4 text-center">
        <h3 className="text-xl text-black-100 font-semibold">{item.name}  <a className="text-purple-300"> #{nftInfo[1]}</a></h3>
        <p className="text-md text-black-100 my-2">
          {nftInfo[0].slice(0, 6)}...{nftInfo[0].slice(-4)}
        </p>
        {/* <p className="text-sm text-gray-500">idx：{nftInfo[1]}</p> */}
        <div className="flex justify-between items-center my-2">
          <p className="text-md font-bold text-pink-500">
            {item.price ? `${nftInfo[2]}%` : `Share: ${nftInfo[2]}%`}
            <span className="text-sm font-normal text-pink-300 ml-2">
              {item.share ? `(${item.share}%)` : ""}
            </span>
          </p>
          {item.price && (
            <p className="text-md font-bold text-pink-500">
              {Number(item.price) / 10 ** 12} SNS
            </p>
          )}
        </div>

        <div className="flex justify-between items-center  -mx-2">
          <Dialog open={open} onOpenChange={setOpen}>
            {item.share ? (
              <div className="w-full flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleUnlist(item);
                  }}
                >
                  Unlist
                </Button>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setpubItem(item);
                      setIsUpdate(true);
                      setshareMes(item.nft[2]);
                      setshareVal(item.nft[2]);
                      setpriceVal(Number(item.price / 10 ** 12));
                      // console.log("publish", item);
                    }}
                  >
                    Update
                  </Button>
                </DialogTrigger>
              </div>
            ) : (
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setIsUpdate(false);
                    setpubItem(item);
                    setshareMes(item.nft[2]);
                    setshareVal(item.nft[2]);
                    // console.log("publish", item);
                  }}
                >
                  List for sale
                </Button>
              </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle> List for sale Form</DialogTitle>
                {/* <DialogDescription>Enter share and price.</DialogDescription> */}
              </DialogHeader>
              <form onSubmit={handlePublish}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="share" className="text-right text-black">
                      Share(%)
                    </label>
                    <Input
                      id="share"
                      name="share"
                      type="number"
                      value={shareMes}
                      disabled={isUpdate}
                      onChange={(e) => {
                        const max = shareVal;
                        const value = Number(e.target.value);
                        if (value >= 0 && value <= max) {
                          // 检查范围
                          setshareMes(value);
                          console.log(max);
                        } else {
                          toast({
                            title: (
                              <div className="flex items-center">
                                <RiErrorWarningLine
                                  size={50}
                                  style={{ fill: "white", marginRight: "2rem" }}
                                />
                                Value must be between 0 and {max}
                              </div>
                            ) as unknown as string,
                            variant: "warning",
                          });
                          // 如果不在范围内，可以选择不更新状态或给出提示
                          console.warn("Value must be between 0 and 100");
                        }
                      }} // 处理输入变化
                      className="col-span-3 w-[150px]"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="price" className="text-right text-black">
                      Price(SNS)
                    </label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={priceVal}
                      className="col-span-3 w-[150px]"
                      step="0.01"
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 0) {
                          // 检查范围
                          setpriceVal(value);
                        } else {
                          toast({
                            title: (
                              <div className="flex items-center">
                                <RiErrorWarningLine
                                  size={50}
                                  style={{ fill: "white", marginRight: "2rem" }}
                                />
                                Value must be more than 0
                              </div>
                            ) as unknown as string,
                            variant: "warning",
                          });
                          // 如果不在范围内，可以选择不更新状态或给出提示
                          console.warn("Value must be between 0 and 100");
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" variant="dark">
                    Submit
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
// accept offer
const ListBox = ({ item, handleOffer, handleRejectOffer }) => {
  return (
    <li>
      <div className="flex justify-between gap-x-6 py-5">
        <div className="flex gap-x-4 w-full">
          <Image
            className="h-12 w-12 flex-none rounded-full bg-gray-50"
            src={item.url}
            alt=""
            width={48}
            height={48}
          />
          <div className="w-full flex-auto">
            <div className="flex w-full gap-8 border-b-2 border-white">
              <p className="text-lg font-semibold leading-6 text-white">
                {item.name} <a className="text-purple-300"> #{item.nft[1]}</a>
              </p>
              <p className="text-sm leading-6 text-white">
                Address :{" "}
                <span className="text-sm pl-2 text-purple-300  font-semibold">
                  {item.nft[0].slice(0, 6)}...{item.nft[0].slice(-4)}
                </span>
              </p>
              {/* <p className="text-sm  leading-6 text-white">
                IDX:{" "}
                <span className="text-sm pl-2 text-purple-300  font-semibold">
                  {item.nft[1]}
                </span>
              </p> */}
              <p className="text-sm  leading-6 text-white">
                Share (%) :{" "}
                <span className="pl-2 text-purple-300  font-semibold">
                  {item.nft[2]}
                </span>
              </p>
            </div>
            <p className="mt-2 truncate text-xs leading-5 text-white">
              Offer NFT Num :
              <span className="px-2 font-semibold text-sm text-red-400">
                {item.offers.length}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="pl-8">
        {item.offers.map((itm, idx) => {
          return (
            <div key={`offer-${itm.buyer}`}>
              <div className="min-w-0 flex-auto flex justify-between items-center mb-4">
                <p className="text-5 leading-6 text-white">
                  <span className="pr-2">{idx + 1}.</span> Buyer :{" "}
                  <span className="text-purple-300 font-semibold ">
                    {itm.buyer.slice(0, 6)}...{itm.buyer.slice(-4)}
                  </span>
                </p>
                <p className="mt-1 truncate leading-5 text-white">
                  Offer price (SNS) :{" "}
                  <span className="text-purple-300  font-semibold">
                    {Number(itm.tokenAmount) / 10 ** 12}
                  </span>
                </p>
                <div className="flex justify-between">
                  <Button
                    onClick={() => {
                      handleOffer(item, idx);
                    }}
                    className="px-2 py-2 rounded-md  bg-purple-300 text-black "
                  >
                    Accept
                  </Button>
                  <Button
                    className="ml-2"
                    onClick={() => {
                      handleRejectOffer(item, idx);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
              {itm.offeredNfts.map((offItm, idx) => (
                <div
                  className="pl-6 min-w-0 flex-auto flex gap-4 "
                  key={`offer-${idx}`}
                >
                  <p className="flex justify-center items-center truncate text-md font-semibold  leading-5 text-white">
                    <BiSolidMessageSquareDetail size={30} color="#c3a6e9" />
                    {/* Name: */}
                    <span className="pl-2 font-semibold">
                      {itm.offeredNftsInfo[idx].name}{" "}
                      <a className="text-purple-300">#{offItm[1]}</a>
                    </span>
                  </p>
                  <p className="text-sm mt-1 truncate leading-5 text-white">
                    Address :
                    <span className="pl-2 text-purple-300  font-semibold">
                      {offItm[0].slice(0, 6)}...
                      {offItm[0].slice(-4)}
                    </span>
                  </p>

                  {/* <p className="mt-1 truncate  font-semibold  leading-5 text-white">
                    IDX:
                    <span className="pl-2 text-purple-300  font-semibold">
                      {offItm[1]}
                    </span>
                  </p> */}
                  <p className="text-sm mt-1 truncate leading-5 text-white">
                    Share (%) :
                    <span className="pl-2 text-purple-300  font-semibold">
                      {offItm[2]}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </li>
  );
};
// send offer
const ListBox1 = ({ item, handleCancelOffer }) => {
  return (
    <li>
      <div className="flex justify-between gap-x-6 py-5">
        <div className="flex gap-x-4 w-full">
          <Image
            className="h-12 w-12 flex-none rounded-full bg-gray-50"
            src={item.url}
            alt=""
            width={48}
            height={48}
          />
          <div className="w-full flex-auto">
            <div className="flex w-full gap-8 border-b-2 border-white">
              <p className="text-lg font-semibold leading-6 text-white">
                {item.name} <a className="text-purple-300">#{item.nft[1]}</a>
              </p>
              <p className="text-sm leading-6 text-white">
                Address:{" "}
                <span className="pl-2 text-purple-300  font-semibold">
                  {item.nft[0].slice(0, 6)}...
                  {item.nft[0].slice(-4)}
                </span>
              </p>
              {/* <p className="text-sm  leading-6 text-white">
                IDX:{" "}
                <span className="text-sm pl-2 text-purple-300  font-semibold">
                  {item.nft[1]}
                </span>
              </p> */}
              <p className="text-sm leading-6 text-white">
                Share (%):{" "}
                <span className=" pl-2 text-purple-300 font-semibold">
                  {item.nft[2]}
                </span>
              </p>
            </div>
            <div className="flex justify-between pt-2">
              <div className="flex items-center">
                <p className="truncate text-xs leading-5 text-white">
                  Offered NFT Num :
                  <span className="px-2 font-semibold text-sm text-red-400">
                    {item.offeredNfts.length}
                  </span>
                </p>
                <p className="pl-3 truncate text-xs leading-5 text-white">
                  Offer price (SNS) :
                  <span className="text-sm pl-2 text-purple-300  font-semibold">
                    {Number(item.tokenAmount.replace(/,/g, "")) / 10 ** 12}
                  </span>
                </p>
              </div>
              <Button
                className="mr-2"
                onClick={() => {
                  // console.log("reject");
                  handleCancelOffer(item);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="pl-8">
        {item.offeredNfts.map((itm, idx) => {
          return (
            <div key={`offer-send-${idx}`}>
              <div className="min-w-0 flex-auto flex justify-between">
                <p className="text-5 font-semibold leading-6 text-white">
                  {/* <span className="pr-2">{idx + 1}.</span> */}
                </p>
                <div className="pl-6 min-w-0 flex-auto flex gap-4 ">
                  <p className="flex justify-center items-center truncate text-md font-semibold  leading-5 text-white">
                    <BiSolidMessageSquareDetail size={30} color="#c3a6e9" />
                    {/* name: */}
                    <span className="pl-2 font-semibold">
                      {item.offeredNftsInfo[idx].name}{" "}
                      <a className="text-purple-300"> #{itm[1]}</a>
                    </span>
                  </p>
                  <p className="text-sm mt-1 truncate leading-5 text-white">
                    Address:
                    <span className="pl-2 text-purple-300  font-semibold">
                      {itm[0].slice(0, 6)}...
                      {itm[0].slice(-4)}
                    </span>
                  </p>

                  {/* <p className="mt-1 truncate  font-semibold  leading-5 text-white">
                    id:
                    <span className="pl-2 text-purple-300  font-semibold">
                      {itm[1]}
                    </span>
                  </p> */}
                  <p className="text-sm mt-1 truncate leading-5 text-white">
                    Share (%):
                    <span className="pl-2 text-purple-300  font-semibold">
                      {itm[2]}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </li>
  );
};
