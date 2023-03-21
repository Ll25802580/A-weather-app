function requestLocation(lat, lon, success, error) {
  loadJSON('https://weathergirls.fathom.info/location/' + lat + ',' + lon, success, error);
}


function parseAddress(data) {
  if (data.status !== 'OK') {
    print('Cannot get address because status was ' + data.status);
    return null;
  }
  return data.results[0].formatted_address;
}


function parseLocation(data) {
  if (data.status !== 'OK') {
    print('Cannot parse location because status was ' + data.status);
    return null;
  }
  // the first result is usually the only one worth looking at
  let result = data.results[0];
  
  let neighborhood = '';
  let city = '';
  let sublocality = null;
  let stateShort = '';  // 'state' or equivalent
  let stateLong = '';
  let countryShort = '';
  let countryLong = '';

  let components = result.address_components;
  components.forEach(function(comp) {
    if (comp.types.includes('neighborhood')) {
      // Upper East Side != UES was the only difference between short/long
      neighborhood = comp.long_name;
    }
    if (comp.types.includes('locality')) {
      city = comp.long_name;
    }
    if (comp.types.includes('sublocality')) {
      sublocality = comp.long_name;
    }
    if (comp.types.includes('administrative_area_level_1')) {
      stateShort = comp.short_name;
      stateLong = comp.long_name;
    }
    if (comp.types.includes('country')) {
      countryShort = comp.short_name;
      countryLong = comp.long_name;
    }

    if (sublocality != null) {
      if (city == '') {
        city = sublocality;  // handles NYC
      }
    }
  });

  /*
  if (stateShort == stateLong) {
    stateShort = '';
  }
  */

  let location = result.geometry.location;
  let lat = location.lat;
  let lon = location.lng;

  let address = result.formatted_address;

  return {
    'lat': lat,
    'lon': lon,
    'address': address,
    'neighborhood': neighborhood,
    'city': city,
    'state': stateLong,
    'state_short': stateShort,
    'country': countryLong,
    'country_short': countryShort
  };
}
