import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { availableSounds, selectPlayingSounds, setSoundToPlayed, soundNames } from "./soundSlice";
import useSound from 'use-sound'

const SoundPlayer = () => {
    const dispatch = useDispatch()
    const playingSounds = useSelector(selectPlayingSounds);
    const newOrderSound = playingSounds[soundNames.newOrderSound];
    const [playNewOrderSound] = useSound("/admin/sounds/notification.mp3")
    useEffect(() => {
        if (newOrderSound && playNewOrderSound) {
            console.log("PLAYING NEW ORDER SOUND")
            playNewOrderSound()
            dispatch(setSoundToPlayed(soundNames.newOrderSound))
        }
    }, [newOrderSound, playNewOrderSound]);
    return <></>;
};

export default SoundPlayer;
