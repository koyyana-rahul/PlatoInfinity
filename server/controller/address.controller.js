import {
  getStates,
  getDistricts,
  getAddressByPincode,
} from "../services/address.service.js";

export function statesController(req, res) {
  return res.json(getStates());
}

export function districtsController(req, res) {
  const { state } = req.query;
  if (!state) {
    return res.status(400).json({ message: "State required" });
  }
  return res.json(getDistricts(state));
}

export function pincodeController(req, res) {
  const { pincode } = req.query;
  if (!pincode) {
    return res.status(400).json({ message: "Pincode required" });
  }

  const data = getAddressByPincode(pincode);
  if (!data || !data.length) {
    return res.status(404).json({ message: "Invalid pincode" });
  }

  return res.json(data[0]);
}
