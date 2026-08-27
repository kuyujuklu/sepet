export const pubs_api = {
  async getAvailablePubsForLocation({ lat, lng }) {
    try {
      const resp = await fetch(`/api/client/get-available-pubs?lat=${lat}&lng=${lng}`)
      return await resp.json()
    } catch (err) {
      console.log("getAvailablePubsForLocation failed: ", err)
      return { ok: false, pubs: [], error: err }
    }
  }

}
