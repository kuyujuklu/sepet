import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as Linking from 'expo-linking';
import { selectPubID, setPubID, setPath, setOrderID, setPubName, selectPubName } from './linkingSlice';
import { useGetPubInfoQuery } from '../../../shared/api/pubs/pubsApi';
import { parseDeepLink } from '../../../shared/utils/deepLink';

const LinkingWathcer = () => {
  const dispatch = useDispatch();
  const url = Linking.useURL();
  const urlPubID = useSelector(selectPubID);
  const urlPubName = useSelector(selectPubName);

  useEffect(() => {
    const parsed = parseDeepLink(url);
    if (!parsed) return;

    dispatch(setPath(parsed.path));

    if (parsed.pubID) {
      dispatch(setPubID(parsed.pubID));
    }
    if (parsed.pubName) {
      dispatch(setPubName(parsed.pubName));
    }
    if (parsed.orderID) {
      dispatch(setOrderID(parsed.orderID));
    }
  }, [url])

  const {
    data: pubData,
    error: pubError,
    pubIsLoading,
  } = useGetPubInfoQuery(
    { pubID: urlPubID, pubName: urlPubName },
    { skip: (!urlPubID && !urlPubName) },
  );


  return (
    <>
    </>
  )
}

export default LinkingWathcer
