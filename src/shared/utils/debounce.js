const newDebounce = (func, delay) => {
    let timeout;
    let globalLastID = 0;

    return function(...args) {
        const context = this;
        let localLastID = Math.random();


        if(timeout) {
            clearTimeout(timeout);
        }

        globalLastID = localLastID;

        timeout = setTimeout(() => {
            if(globalLastID !== localLastID) return;
            
            timeout = null;
            func.apply(context, args);
        }, delay);
    }

}
export default newDebounce;