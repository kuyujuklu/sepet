import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useGetPubInfoQuery } from '../../../shared/api/pubs/pubsApi';
import pkg from "../../../../app.json"
const parsedCurrentVersion = parseInt(pkg.expo.version?.split(".")?.join('')) || 0
import { selectIsVersionExpired, setVersion } from './versionSlice';
import { useGetAppVersionInfoQuery } from '../../../shared/api/client/clientApi';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { Screens } from '../../../../App';

const LinkingWathcer = () => {
  const dispatch = useDispatch();
  const navigator = useNavigation()
  const isExpired = useSelector(selectIsVersionExpired)


  const {
    data: versionInfoData,
    error: versionInfoError,
    versionInfoIsLoading,
  } = useGetAppVersionInfoQuery({}, { pollingInterval: 5000 });


  useEffect(() => {
    if (!versionInfoData?.min_active_version) {
      dispatch(setVersion({ version: pkg.expo.version, isExpired: false }))
      return;
    }

    console.log("VERSION INFO DATA: ", versionInfoData)

    const parsedMinVersion = parseInt(versionInfoData?.min_active_version?.split(".")?.join(''))
    console.log("MIN VERSION: ", parsedMinVersion)
    console.log("CURRENT VERSION: ", parsedCurrentVersion)

    if (!parsedMinVersion || !parsedCurrentVersion) {
      dispatch(setVersion({ version: pkg.expo.version, isExpired: false }))
      return
    }

    if (parsedCurrentVersion < parsedMinVersion) {
      console.log("VERSION IS EXPIRED")
      dispatch(setVersion({ version: pkg.expo.version, isExpired: true }))
      return;
    }
  }, [dispatch, versionInfoData])

  useEffect(() => {
    if (isExpired) {
      navigator.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: Screens.ExpiredVersionPage }],
        }),
      );
    }

  }, [isExpired])

  return (
    <>
    </>
  )
}

export default LinkingWathcer
