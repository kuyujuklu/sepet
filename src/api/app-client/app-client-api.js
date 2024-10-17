export const deleteAccount = async ({phone, password}) => {
    
    const resp = await fetch("/api/client/delete-client", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({phone, password})
    })

    let error = null
    const body = await resp.json().catch(err => error = err)
    if(!body || error) {
        return {
            ok: false,
            err: "something went wrong"
        }
    }

    return body
}