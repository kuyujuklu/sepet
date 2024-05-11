import Alert from "./Alert";

import style from "../../sass/components/alerts/alerts.module.scss";
import { useSelector } from "react-redux";
import { selectAlerts } from "./alertSlice";

const Alerts = () => {
    const alerts = useSelector(selectAlerts);

    return (
        <div className={style.alertsContainer}>
            {alerts.map((alert) => (
                <Alert
                    key={alert.id}
                    id={alert.id}
                    header={alert.header}
                    message={alert.message}
                    type={alert.type}
                    delay={alert.delay}
                />
            ))}
        </div>
    );
};

export default Alerts;
