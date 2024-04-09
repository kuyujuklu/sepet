import { VStack, View } from "native-base"
import MyAlert from "./MyAlert"
import { useSelector } from "react-redux"
import { selectAlerts } from "../../features/store/alerts/alertSlice"

const AlertWrapper = () => {
  const alerts = useSelector(selectAlerts)

  return (
    <VStack position={"absolute"} width={"100%"} height={"100%"} space="2" flexDir={"column-reverse"} pb="20" pl={"1"} maxW={400}>
        {alerts?.map(alert => {
          return <MyAlert key={alert.id} id={alert.id} status={alert.status} title={alert.title} delay={alert.delay}/>
        })}
    </VStack>
  )
}

export default AlertWrapper