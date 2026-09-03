import { appErrors } from "../../errors/errors";
import { convertRespError } from "../resperrors/convertRespError";

const doRefresh = async (url) => {
    const resp = await fetch(url, {
        method: "POST",
        credentials: "include"
    }).catch((err) => {
        console.log(err);
    });

    let err;
    const body = await resp.json().catch((e) => {
        err = e;
    });
    if(err || !body) {
        return {
            ok: false,
            err: appErrors.something_went_wrong
        }
    }

    if(body.ok) {
        return {
            ok: true,
            accesstoken: body.accesstoken
        };
    }

    if(!body.ok) {
        return {
            ok: false,
            err: convertRespError(body.err)
        }
    }
}

export const refreshToken = () => doRefresh("/api/auth/refresh-token");

// Explicit "give me back my admin session" - the ordinary refreshToken()
// above renews whatever role the current session already has (used
// everywhere, including ambient 401-retries while a superadmin is
// legitimately browsing inside an impersonated venue), so it must never do
// this on its own. See auth.go's RefreshToken handler for the matching
// ?as=admin check against the admin_refresh_token cookie, which survives
// the venue-impersonation token exchange untouched.
export const refreshTokenAsAdmin = () => doRefresh("/api/auth/refresh-token?as=admin");