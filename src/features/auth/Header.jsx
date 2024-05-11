const Header = () => {
  
    return (
        <div className="flex gap-2 items-center">
            <image src="/static/admin/images/png/qr-logo-512x512.png" width={50} height={50} alt="qr-logo" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">
                Sandex - QrMenu
            </h1>
        </div>
  )
}

export default Header