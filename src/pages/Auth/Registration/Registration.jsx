import RegistrationForm from "../../../widgets/Auth/Registration/RegistrationForm";
import AppHeader from "../../../widgets/AppHeader/AppHeader";
import Wrapper from "../../Wrapper";

const Registration = () => {
  return (
    <Wrapper>
      <AppHeader showBack showAddress={false} right={null} />

      <RegistrationForm />
    </Wrapper>
  );
};

export default Registration;
