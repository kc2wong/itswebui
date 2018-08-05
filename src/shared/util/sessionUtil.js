// @flow
import { parseBool } from "./lang";

const AUTHENTICATION_TOKEN_HEADER = 'authenticationToken'

export function setAuthenticationToken(token: string, persist: bool) {
    if (persist) {
        localStorage.setItem(AUTHENTICATION_TOKEN_HEADER, token);
    }
    else {
        sessionStorage.setItem(AUTHENTICATION_TOKEN_HEADER, token);
    }
}

export function getAuthenticationToken(): ?string {
    let jwt = sessionStorage.getItem(AUTHENTICATION_TOKEN_HEADER);
    if (!jwt) {
        jwt = localStorage.getItem(AUTHENTICATION_TOKEN_HEADER);
    }
    return jwt
}

export function removeAuthenticationToken() {
    sessionStorage.removeItem(AUTHENTICATION_TOKEN_HEADER);
    localStorage.removeItem(AUTHENTICATION_TOKEN_HEADER);
}

export function parseJwt(jwt: string) {
    const base64Url = jwt.split('.')[1]
    const base64 = base64Url.replace('-', '+').replace('_', '/')
    return JSON.parse(atob(base64))
}

export function getCurrentUserid(): ?string {
    const jwt = getAuthenticationToken()
    if (jwt) {
        const base64Url = jwt.split('.')[1]
        const base64 = base64Url.replace('-', '+').replace('_', '/')
        return JSON.parse(atob(base64)).sub
    }
    return null
}