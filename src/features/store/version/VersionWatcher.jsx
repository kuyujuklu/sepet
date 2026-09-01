import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import pkg from "../../../../app.json"
const parsedCurrentVersion = parseInt(pkg.expo.version?.split(".")?.join('')) || 0
import { selectIsVersionExpired, setVersion } from './versionSlice';
import { useGetAppVersionInfoQuery } from '../../../shared/api/client/clientApi';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { Screens } from '../../../app/navigation/screens';

const LinkingWathcer = () => {
  const dispatch = useDispatch();
  const navigator = useNavigation()
  const isExpired = useSelector(selectIsVersionExpired)


  // Was every 5 seconds - 720 requests an hour to learn a number that only
  // changes on a release. Five minutes, and not at all in the background.
  const {
    data: versionInfoData,
    error: versionInfoError,
    versionInfoIsLoading,
  } = useGetAppVersionInfoQuery(
    {},
    { pollingInterval: 300000, skipPollingIfUnfocused: true },
  );


  useEffect(() => {
    if (!versionInfoData?.min_active_version) {
      dispatch(setVersion({ version: pkg.expo.version, isExpired: false }))
      return;
    }

    const parsedMinVersion = parseInt(versionInfoData?.min_active_version?.split(".")?.join(''))

    if (!parsedMinVersion || !parsedCurrentVersion) {
      dispatch(setVersion({ version: pkg.expo.version, isExpired: false }))
      return
    }

    if (parsedCurrentVersion < parsedMinVersion) {
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
