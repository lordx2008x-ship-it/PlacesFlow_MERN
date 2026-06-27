const axios = require('axios');
const HttpError = require('../models/http-error');

const getCoordsForAddress = async (address) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'mern-project' // required by Nominatim
    }
  });

  const data = response.data;

  if (!data || data.length === 0) {
    throw new HttpError('Could not find location for the specified address.', 422);
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
};

module.exports = getCoordsForAddress;