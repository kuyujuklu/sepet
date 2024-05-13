import BlackSpinner from "./BlackSpinner"

const FullPageSpinner = () => {
  return (
    <div  style={{ width: "100vw", height:"100vh" }} className="flex items-center justify-center">
        <BlackSpinner />
    </div>
  )
}

export default FullPageSpinner