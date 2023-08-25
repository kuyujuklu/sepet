import Image from "next/image"

const PubPageUpper = () => {
    return (
        <div 
            style={{
                height: "180px",
                width: "100%",
                position: "absolute",
                overflow: "hidden",
            }}
            className="rounded-t-3xl"
        >
            <Image 
                src="/images/png/putin2.jpg"
                alt="pub-cover"
                fill
                style={{
                    objectFit:"cover",
                }}
            />
        </div>
    )
}

export default PubPageUpper