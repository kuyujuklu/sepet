import Image from "next/image";
import Link from "next/link";

const Header = () => {
    return (
        <div className="border-b border-gray-300 flex justify-between items-center px-2 sm:px-8 pt-4 pb-2">
            <div className="flex items-center gap-6">
                <Image
                    width={40}
                    height={40}
                    src="/images/png/qr-logo-192x192.png"
                    alt="logo"
                />
                <h1 className="text-xl sm:text-2xl text-gray-800 font-medium mr-12">
                    Sandex - QrMenu
                </h1>
            </div>
            <div className="flex items-center gap-3">
                <a href={`/pub/koffee_time`}>
                    <button className="bg-blue-600 rounded-3xl py-2 px-6 text-white hover:bg-blue-700" style={{transition:"all .3s"}}>
                        ПРЕДПРОСМОТР!
                    </button>
                </a>
                <Link href="/admin/company">
                    <Image
                        width={30}
                        height={30}
                        src="/images/svg/profile-black.svg"
                        alt="profile"
                        className="cursor-pointer"
                    />
                </Link>
            </div>
        </div>
    );
};

export default Header;
