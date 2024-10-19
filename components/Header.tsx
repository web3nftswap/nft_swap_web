/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-10-11 17:01:06
 * @LastEditors: Hesin
 * @LastEditTime: 2024-10-19 09:57:42
 */
import MobilNav from "@/components/MobilNav";
import Nav from "@/components/Nav";
import Link from "next/link";

// import ConnectButton from "@/components/ConnectButton";
import dynamic from "next/dynamic";
import Image from "next/image";

const ConnectButton = dynamic(() => import("@/components/ConnectButton"), {
  ssr: false,
});
const Header = () => {
  return (
    <div className="fixed top-0 z-50 bg-background bg-opacity-50 border-b-2 pt-4 px-0 h-20 xl:h-16 text-white container mx-auto flex justify-between otems-center">
      {/* logo */}
      <Link href="/">
        <h1 className="text-4xl font-semibold ">
          <Image src={`/images/logo.png`} alt="" width="300" height="30" />
          {/* NFT-Swap <span className="text-white">.</span> */}
        </h1>
      </Link>
      {/* Nav */}
      <div className="z-50 hidden lg:flex items-center gap-8">
        <Nav />
        {/* RAINBOW */}
        <ConnectButton />
      </div>

      {/* mobile nav */}
      <div className="lg:hidden ">
        <MobilNav />
      </div>
    </div>
  );
};
export default Header;
