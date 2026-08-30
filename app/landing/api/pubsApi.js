export const pubs_api = {
  async getAvailablePubsForLocation({ lat, lng }) {
    try {
      const resp = await fetch(`/api/client/get-available-pubs?lat=${lat}&lng=${lng}`)
      return await resp.json()
    } catch (err) {
      console.log("getAvailablePubsForLocation failed: ", err)
      return { ok: false, pubs: [], error: err }
    }
  },

  // The aggregated home feed: dishes of every pub that delivers to this
  // point, ranked server-side (hits, then orders_count, then place; closed
  // pubs sink) and interleaved so one long menu cannot fill the row. Each
  // dish carries the summary of its own pub, so nothing here needs a second
  // request to price it or to link to it.
  async getTopDishesForLocation({ lat, lng, section, filter = "top", limit = 8 }) {
    const query = new URLSearchParams({ lat, lng, filter, limit: String(limit) })
    if (section) query.set("section", section)

    try {
      const resp = await fetch(`/api/client/get-available-top-dishes?${query}`)
      return await resp.json()
    } catch (err) {
      console.log("getTopDishesForLocation failed: ", err)
      return { ok: false, dishes: [], error: err }
    }
  },
}
