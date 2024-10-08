import { useDispatch } from "react-redux";
import Wrapper from "../../Wrapper";
import { useEffect } from "react";
import { disableNavbar } from "../../../features/store/navbar/navbarSlice";
import ChangePasswordForm from "../../../widgets/Auth/ChangePassword/ChangePasswordForm";

const ChangePassword = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(disableNavbar());
  }, [dispatch]);
  return (
    <Wrapper style={{paddingBottom: 0}}>
      <ChangePasswordForm />
    </Wrapper>
  );
};

export default ChangePassword;
