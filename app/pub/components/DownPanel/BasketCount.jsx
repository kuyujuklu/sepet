const BasketCount = ({count}) => {
    return (
        <>
            {count > 0 && (
                <div
                    className="absolute bg-red-600 rounded-full aspect-square text-3xs px-1 flex items-center"
                    style={{
                        top: -5,
                        right: -5,
                    }}
                    width={20}
                    height={20}
                >
                    {count}
                </div>
            )}
        </>
    );
};

export default BasketCount;
