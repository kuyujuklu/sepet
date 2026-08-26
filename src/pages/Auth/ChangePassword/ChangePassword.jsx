import AppHeader from "../../../widgets/AppHeader/AppHeader";
import Wrapper from "../../Wrapper";
import ChangePasswordForm from "../../../widgets/Auth/ChangePassword/ChangePasswordForm";

const ChangePassword = () => {
  return (
    <Wrapper>
      <AppHeader showBack showAddress={false} right={null} />

      <ChangePasswordForm />
    </Wrapper>
  );
};

export default ChangePassword;
