export const pubs_api = {
  async getAvailablePubsForLocation({ lat, lng }) {
    let error = null;

    const respJSON = await fetch(`/api/client/get-available-pubs?lat=${lat}&lng=${lng}`)
      .then(resp => resp.json())
      .catch(err => error = err)

    return respJSON;
  }

}
