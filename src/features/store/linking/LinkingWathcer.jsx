import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as Linking from 'expo-linking';
import { selectPubID, setPubID, setPath, setOrderID, setPubName, selectPubName } from './linkingSlice';
import { useGetPubInfoQuery } from '../../../shared/api/pubs/pubsApi';
import { Screens } from '../../../app/navigation/screens';

const LinkingWathcer = () => {
  const dispatch = useDispatch();
  const url = Linking.useURL();
  const urlPubID = useSelector(selectPubID);
  const urlPubName = useSelector(selectPubName);

  useEffect(() => {
    if (url) {
      const parsedUrl = Linking.parse(url);
      const queryParams = parsedUrl.queryParams;

      let path = queryParams.Path;

      let pubName = null
      let pubID = queryParams.PubID

      let partsOfPath = parsedUrl?.path?.split("/") ?? [];
      let indexOfPubWord = partsOfPath.findIndex((part) => part === "pub");


      if (indexOfPubWord >= 0 && partsOfPath.length > indexOfPubWord + 1) {
        path = Screens.PubInfo

        const pubIdentifier = partsOfPath[indexOfPubWord + 1] || queryParams.PubID;
        if (isNaN(+pubIdentifier)) {
          pubName = pubIdentifier
        }
        else {
          pubID = +pubIdentifier
        }
      }
      dispatch(setPath(path));

      if (pubID) {
        dispatch(setPubID(pubID));
      }
      if (pubName) {
        dispatch(setPubName(pubName));
      }
      if (queryParams.OrderID) {
        dispatch(setOrderID(+queryParams.OrderID ?? null));
      }
    }
    else {
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
