import AuthenticationForm from "../../../widgets/Auth/Auhtentication/AuthenticationForm";
import AppHeader from "../../../widgets/AppHeader/AppHeader";
import Wrapper from "../../Wrapper";

const Authentication = () => {
  return (
    <Wrapper>
      {/* The form is reachable from the basket, the profile and a deep link,
          and none of them left a way back before this header */}
      <AppHeader showBack showAddress={false} right={null} />

      <AuthenticationForm />
    </Wrapper>
  );
};

export default Authentication;
