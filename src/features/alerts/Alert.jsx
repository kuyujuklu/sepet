import { memo, useEffect, useRef, useState } from "react"
import style from "../../sass/components/alerts/alerts.module.scss"
import { useDispatch } from "react-redux"
import { removeAlert } from "./alertSlice"

const Alert = ({id, header, message, delay, type}) => {
    const dispatch = useDispatch()
    const [hidden, setHidden] = useState(true)
    const [expired, setExpired] = useState(false)
    const alertRef = useRef()

    useEffect( () => {
        setTimeout( () => {
            setHidden(false)
        }, 1)
        
        //  After the alert is rendered, start to hide it
        if(delay) {
            setTimeout( () => {
                setExpired(true)
                setTimeout( () => {
                    dispatch(removeAlert(id));
                }, 1000)
            }, delay + 500)
        }
    }, [delay, dispatch, id])

    const handleCloseButtonClick = () => {
        setHidden(true)
        setTimeout( () => {
            dispatch(removeAlert(id));
        }, 500)
    }

  return (
    <div 
        className={`${style.alert} ${hidden ? style.alertHidden : ""}
            ${  type === "success" ? style.success : 
                type === "danger" ? style.danger :
                style.warning
            }`}
        style={expired ? {transition: "1s", opacity: 0} : {}}
        ref={alertRef}
    >
        {/* Cross */}
        <span 
            className="absolute block h-fit w-fit right-3 text-2xl p-0 cursor-pointer"
            style={{top: "-3px"}}
            onClick={handleCloseButtonClick}
        >&times;</span>

        {header && 
            <h1 className="text-sm mx-5">
                {header}
            </h1>
        }
        <p className="text-2xs mx-5">{message}</p>
    </div>
  )
}

export default memo(Alert)