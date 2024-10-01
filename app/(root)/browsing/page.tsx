import Heros from "@/components/Heros";
import Nav from "@/components/Nav";
import Link from "next/link";

const Browsing = () => {
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden sm:px-10 px-5">
      <div className="border-b-2 pt-4 h-20 xl:h-16 text-white container mx-auto flex justify-between otems-center">
        {/* logo */}
        <Link href="/">
          <h1 className="text-4xl font-semibold">
            NFT-Swap <span className="text-white">.</span>
          </h1>
        </Link>
        {/* Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <Nav />
          {/* RAINBOW */}
          {/*F <ConnectButton /> */}
        </div>
      </div>
      <div className="max-w-7xl w-full">
        {/* <Heros /> */}
      </div>
    </main>
  );
};

export default Browsing;
