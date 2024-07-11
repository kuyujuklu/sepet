import { Button } from "@mui/material"
import Link from "next/link"

const SwitchLang = ({lang}) => {
  return (
    <div className="">
        <div className="flex gap-2">
            <Link href="/">
                <button
                    variant="contained"
                    style={{
                        padding:"5px 10px",
                        color: lang === "ru" ? "white" : "black",
                        background: lang === "ru" ? "rgb(31 41 55)" : "transparent",
                        border: "rgb(31 41 55)",
                        fontSize: ".7rem",
                        fontWeight: "medium",
                        borderRadius: "10px",
                        textAlign: "left",
                        ":hover": {
                            bgcolor: "rgb(17 24 39)",
                            color: "white",
                        },
                    }}
                >
                    RU
                </button>
            </Link>
            <Link href="/ro">
                <button
                    variant="contained"
                    style={{
                        padding:"5px 10px",
                        color: lang === "ro" ? "white" : "black",
                        background: lang === "ro" ? "rgb(31 41 55)" : "transparent",
                        border: "rgb(31 41 55)",
                        fontSize: ".7rem",
                        fontWeight: "medium",
                        borderRadius: "10px",
                        textAlign: "left",
                        ":hover": {
                            bgcolor: "rgb(17 24 39)",
                            color: "white",
                        },
                    }}
                >
                    RO
                </button>
            </Link>
            </div>
    </div>
  )
}

export default SwitchLang