import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Navigate, createSearchParams } from "react-router-dom";
import { loginPostAsync, logout } from "../slices/loginSlice.js";

export default function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginState = useSelector((state) => state.loginSlice);
  const isLogin = !!loginState.accessToken;

  const doLogin = async (loginParam) => {
    const action = await dispatch(loginPostAsync(loginParam));
    return action.payload;
  };

  const doLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const moveToPath = (path) => {
    navigate({ pathname: path }, { replace: true });
  };

  const moveToLogin = () => {
    navigate({ pathname: "/login" }, { replace: true });
  };

  const moveToLoginReturn = () => {
    return <Navigate replace to="/login" />;
  };

  const exceptionHandle = (ex) => {
    const errorMsg = ex.response?.data?.error;

    if (!errorMsg) return;

    const errorStr = createSearchParams({ error: errorMsg }).toString();

    if (errorMsg === "REQUIRE_LOGIN") {
      alert("로그인 해야 합니다.");
      navigate({ pathname: "/login", search: errorStr });
    } else if (errorMsg === "ERROR_ACCESSDENIED") {
      alert("권한이 없습니다.");
      navigate({ pathname: "/login", search: errorStr });
    }
  };

  return {
    loginState,
    isLogin,
    doLogin,
    doLogout,
    moveToPath,
    moveToLogin,
    moveToLoginReturn,
    exceptionHandle,
  };
}
