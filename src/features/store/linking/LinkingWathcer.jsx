import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as Linking from 'expo-linking';
import { selectPubID, setPubID, setPath, setOrderID, setPubName, selectPubName } from './linkingSlice';
import { useGetPubInfoQuery } from '../../../shared/api/pubs/pubsApi';
import { Screens } from '../../../../App';

const LinkingWathcer = () => {
  const dispatch = useDispatch();
  const url = Linking.useURL();
  const urlPubID = useSelector(selectPubID);
  const urlPubName = useSelector(selectPubName);

  useEffect(() => {
    if (url) {
      console.log("-----------URL: ", url)
      const parsedUrl = Linking.parse(url);
      const queryParams = parsedUrl.queryParams;

      let path = queryParams.Path;

      let pubName = null
      let pubID = queryParams.PubID

      let partsOfPath = parsedUrl?.path?.split("/") ?? [];
      console.log("parts of path: ", partsOfPath)
      let indexOfPubWord = partsOfPath.findIndex((part) => part === "pub");
      console.log("idx: ", indexOfPubWord);


      if (indexOfPubWord >= 0 && partsOfPath.length > indexOfPubWord + 1) {
        path = Screens.PubInfo
        console.log("here: ", indexOfPubWord);

        const pubIdentifier = partsOfPath[indexOfPubWord + 1] || queryParams.PubID;
        console.log("identifier: ", pubIdentifier);
        if (isNaN(+pubIdentifier)) {
          pubName = pubIdentifier
        }
        else {
          pubID = +pubIdentifier
        }
      }

      console.log("-----------QUERY PARAMS: ", queryParams)
      console.log("-----------PATH: ", path)
      console.log("-------------------------------------------------PUB ID: ", pubID)
      console.log("-------------------------------------------------PUB NAME: ", pubName)
      console.log("-------------------------------------------------ORDER ID: ", queryParams.OrderID)
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
      console.log("CANNOT FIND URL FOR Linking.useURL()")
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
