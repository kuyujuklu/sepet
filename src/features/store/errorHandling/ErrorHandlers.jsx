import AuthErrorHandler from "./ErrorHandlers/AuthErrorHandler"
import ClientErrorHandler from "./ErrorHandlers/ClientErrorHandler"
import OrdersErrorHandler from "./ErrorHandlers/OrdersErrorHandler"
import StandardErrorHandler from "./StandardErrorHandler"

const ErrorHandlers = () => {
  return (
    <>
        <StandardErrorHandler />
        <AuthErrorHandler />
        <ClientErrorHandler />
        <OrdersErrorHandler />
    </>
  )
}

export default ErrorHandlers