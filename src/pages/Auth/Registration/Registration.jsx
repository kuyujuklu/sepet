import { useDispatch } from "react-redux";
import RegistrationForm from "../../../widgets/Auth/Registration/RegistrationForm";
import Wrapper from "../../Wrapper";
import { useEffect } from "react";
import { disableNavbar } from "../../../features/store/navbar/navbarSlice";

const Registration = () => {

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(disableNavbar());
  }, [dispatch])
  return (
    <Wrapper style={{ paddingBottom: 0 }}>
      <RegistrationForm />
    </Wrapper>
  );
};

export default Registration;
