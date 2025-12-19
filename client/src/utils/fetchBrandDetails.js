import Axios from "./Axios";
import SummaryApi from "../common/SummaryApi";

const fetchBrandDetails = async () => {
  try {
    const response = await Axios({ ...SummaryApi.getBrandDetails });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export default fetchBrandDetails;
