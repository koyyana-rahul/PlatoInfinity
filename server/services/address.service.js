import cities from "indian-cities-database";
import { search } from "india-pincode-search";

export function getStates() {
  return [...new Set(cities.map((c) => c.state))].sort();
}

export function getDistricts(state) {
  return [
    ...new Set(cities.filter((c) => c.state === state).map((c) => c.district)),
  ].sort();
}

export function getAddressByPincode(pincode) {
  return search(pincode);
}
