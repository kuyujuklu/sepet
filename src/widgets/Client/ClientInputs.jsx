import { Text, View } from "native-base"
import { useGetClientQuery } from "../../shared/api/client/clientApi"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { errorKeys, pushError } from "../../features/store/errorHandling/errorHandlingSlice"
import { useIsFocused } from "@react-navigation/native"

const ClientInputs = () => {
  const dispatch = useDispatch()

  const {data: clientData, error: clientError, isLoading: clientIsLoading} = useGetClientQuery({}, {
    skip: !useIsFocused(),
    refetchOnFocus: true
  })

  //Handling successfully client data query
  useEffect(() => {
    if(!clientData || !clientData.ok) {
      return;
    }
  }, [clientData])


  useEffect(() => {
    if(!clientError) return;
    dispatch(pushError({errorKey: errorKeys.getClient, error: clientError}))

  }, [clientError])

  
    return (
    <View>
        <Text fontSize={25}> this is CLIENT PAGE</Text>
    </View>
  )
}

export default ClientInputs