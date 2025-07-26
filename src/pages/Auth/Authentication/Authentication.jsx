import { useDispatch } from "react-redux";
import AuthenticationForm from "../../../widgets/Auth/Auhtentication/AuthenticationForm";
import Wrapper from "../../Wrapper";
import { useEffect } from "react";
import { disableNavbar } from "../../../features/store/navbar/navbarSlice";

const Authentication = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(disableNavbar());
  }, [dispatch]);


  return (
    <Wrapper style={{ paddingBottom: 0 }}>
      <AuthenticationForm />
    </Wrapper>
  );
};

export default Authentication;
