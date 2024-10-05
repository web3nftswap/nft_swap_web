/*
 * @Descripttion:
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-09-30 18:57:47
 * @LastEditors: Hesin
 * @LastEditTime: 2024-10-05 11:32:07
 */
import Header from "@/components/Header";
import Image from "next/image";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet-box";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const listMap = [
  {
    title: "title1",
    img: "https://app.nftmart.io/static/media/010.2a151c7e.png",
    desc: "desc",
  },
  {
    title: "title2",
    img: "https://app.nftmart.io/static/media/010.2a151c7e.png",
    desc: "desc",
  },
  {
    title: "title3",
    img: "https://app.nftmart.io/static/media/010.2a151c7e.png",
    desc: "desc",
  },
];

const Create = () => {
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden sm:px-10 px-5">
      <Header />
      <div className="max-w-[80%] w-full">
        <div className="w-15 relative  flex max-w-sm items-center space-x-2 my-20">
          <Sheet>
            <SheetTrigger asChild>
              <button className="px-4 py-2 rounded-md border font-semibold border-white-300 uppercase bg-purple-200 text-black text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md">
                Create
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[400px] sm:w-[540px] bg-white"
            >
              <SheetHeader>
                <SheetTitle>Create NFT Collection</SheetTitle>
                <SheetDescription>Make a NFT Collection</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right">
                    Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Collection name"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="img" className="text-right">
                    Img-Link
                  </label>
                  <Input
                    id="img"
                    className="col-span-3"
                    placeholder="image link"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="img" className="text-right">
                    Max-Num
                  </label>
                  <Input
                    id="num"
                    type="number"
                    className="col-span-3"
                    placeholder="max num"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right">
                    Desc
                  </label>
                  <Textarea
                    className="col-span-3"
                    placeholder="Type your desc here."
                  />
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md border font-semibold border-white-300 uppercase bg-purple-200 text-black text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md"
                  >
                    Create
                  </button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
        <ul role="list" className="divide-y divide-gray-100">
          {listMap.map((itm, idx) => (
            <ListBox item={itm} key={idx} />
          ))}
        </ul>
      </div>
    </main>
  );
};

export default Create;

const ListBox = ({ item }) => {
  return (
    <li className="flex justify-between gap-x-6 py-5">
      <div className="flex min-w-0 gap-x-4">
        <Image
          className="h-12 w-12 flex-none rounded-full bg-gray-50"
          src={item.src}
          alt=""
        />
        <div className="min-w-0 flex-auto">
          <p className="text-5 font-semibold leading-6 text-gray-200">
            {item.title}
          </p>
          <p className="mt-1 truncate text-xs leading-5 text-gray-500">
            {item.desc}
          </p>
        </div>
      </div>
      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
        {/* <p className="text-sm leading-6 text-gray-200">Co-Founder / CEO</p> */}
        {/* <p className="mt-1 text-xs leading-5 text-gray-500">Last seen</p> */}
        <button className="px-2 py-2 rounded-md border border-white-100 font-medium bg-purple-200 text-black text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md">
          mint
        </button>
      </div>
    </li>
  );
};
