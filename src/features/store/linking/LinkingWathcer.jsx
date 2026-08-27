import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as Linking from 'expo-linking';
import { selectPubID, setPubID, setPath, setOrderID, setPubName, selectPubName } from './linkingSlice';
import { usePubInfo } from '../../../shared/hooks/usePubInfo';
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

  // Warms the cache entry the pub screen is about to subscribe to, so a deep
  // link opens on a rendered menu rather than a skeleton. Same hook the screen
  // uses, so it is the same cache key - a second, coordinate-less request here
  // would warm nothing.
  usePubInfo({ pubID: urlPubID, pubName: urlPubName });


  return (
    <>
    </>
  )
}

export default LinkingWathcer
