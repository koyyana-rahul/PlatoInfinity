import { useDispatch } from "react-redux";
import Axios from "../api/axios";
import summaryApi from "../api/summaryApi";
import { setUserDetails, logout } from "../store/auth/userSlice";

const useAuth = () => {
  const dispatch = useDispatch();

  const fetchMe = async () => {
    try {
      const res = await Axios(summaryApi.getMe);
      if (res.data.success) {
        dispatch(setUserDetails(res.data.data));
        return res.data.data;
      }
    } catch (err) {
      dispatch(logout());
      return null;
    }
  };

  return { fetchMe };
};

export default useAuth;
