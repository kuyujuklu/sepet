import Inputs from "../Inputs"

const Shipping = ({pub}) => {
  return (
    <>
      <h1 className="text-center text-gray-800 text-xl font-bold mt-2">Shipping</h1>
      <div className="m-auto">
        <Inputs pub = {pub}/>
      </div>
    </>
  )
}

export default Shipping