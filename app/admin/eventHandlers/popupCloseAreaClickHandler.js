export const closePopupAreaClickHandler = (callback) => {
    return (e) => {
        if(e.currentTarget !== e.target)
            return
        const pointerUpHandler = (event) => {
            if(event.currentTarget !== event.target) 
                return
            callback()
            event.target.removeEventListener("pointerup", pointerUpHandler)
        }

        e.target.addEventListener("pointerup", pointerUpHandler)
    }
}