// @flow
import _ from 'lodash';
import forge from 'node-forge';

import { PageResult, SortOrder } from 'shared/model';
import { SERVER_API_URL, SERVER_TIMEOUT_VALUE } from 'app/constant/ApplicationConstant';
import { AUTHENTICATION_TOKEN_HEADER, httpPost } from 'shared/util/networkUtil';
import { parseBool } from 'shared/util/lang';
import { hexToBuffer } from 'shared/util/stringUtil';
import { parseJwt, removeAuthenticationToken, setAuthenticationToken } from 'shared/util/sessionUtil';

const initiateLoginCtxPath = `${SERVER_API_URL}/api/initiateLogin`
const authenticateCtxPath = `${SERVER_API_URL}/api/authenticate`
const hexChar = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "a", "b", "c", "d", "e", "f"];

class AuthenticationService {

    login(userid: string, password: string, newPassword?: string, rememberMe?: Boolean) {
        const data = { userid: userid }
    
        console.log('SERVER_API_URL = ' + SERVER_API_URL);
        console.log('SERVER_TIMEOUT_VALUE = ' + SERVER_TIMEOUT_VALUE);

        return httpPost(initiateLoginCtxPath, null, data, SERVER_TIMEOUT_VALUE, true).then(response => {    
            if (!response.ok) {
                const errorCode = response.headers.get('X-itsweb-errorCode');
                const errorParam = response.headers.get('X-itsweb-errorParam');
                return Promise.reject({ errorCode: errorCode, errorParam: errorParam });
            }
            else {

                let shaObj = forge.md.sha1.create()
                shaObj.update(password)
                const passwordHashHex = shaObj.digest().toHex()
        
                const useridHex = this.stringToHex(userid)

                // SHA(USERID + SHA(PASSWORD))
                shaObj = forge.md.sha1.create()
                shaObj.update(hexToBuffer(useridHex).toString('binary'))
                shaObj.update(hexToBuffer(passwordHashHex).toString('binary'))

                // key = first 16 bytes of above
                const bHashUseridPwd = shaObj.digest().toHex().substring(0, 32).toUpperCase()
                console.log(`bHashUseridPwd = ${bHashUseridPwd}`)

                const bearerToken = response.headers.get('Authorization');
                if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
                    const jwt = parseJwt(bearerToken.slice(7, bearerToken.length));
                    const spk = jwt.spk
                    const wpk = jwt.wpk          
                    const token = jwt.token
                    console.debug(`token = ${token}`)

                    // AES(key, token), where token is generated from server
                    const encToken = this.encryptBySymmetricKey(hexToBuffer(bHashUseridPwd),  hexToBuffer(token))

                    console.debug(`spk = ${spk}`)
                    console.debug(`wpk = ${wpk}`)
                    console.debug(`encToken = ${encToken}`)

                    // RSA(spk, encrypted token)
                    const encToken2 = this.encryptByAsymmetricPublicKey(spk, encToken).toUpperCase()
                    console.debug(encToken2)

                    const encAesKey = this.encryptByAsymmetricPublicKey(wpk, this.byteArrayToHex(forge.random.getBytesSync(16)))
                    console.log(encAesKey)

                    const headers = { 'Authorization': `${bearerToken}`, 'Content-Type': 'application/json;charset=UTF-8' };        
                    const authenData = { 
                            jsessionId: jwt["Set-Cookie"], channelCode: "I",  token: jwt.token, uskToken: encToken.toUpperCase(), 
                            spkUskToken: encToken2, wpkGsk: encAesKey.toUpperCase(), forcelogin: "true", password: password
                    }
                    return httpPost(authenticateCtxPath, headers, authenData, SERVER_TIMEOUT_VALUE, true).then(authResponse => {    
                        if (!authResponse.ok) {
                            const errorCode = authResponse.headers.get('X-itsweb-errorCode');
                            const errorParam = authResponse.headers.get('X-itsweb-errorParam');
                            console.log(`errorCode = ${errorCode}`)
                            return Promise.reject({ errorCode: errorCode, errorParam: errorParam });
                        }
                        else {
                            const bearerToken = authResponse.headers.get('Authorization');
                            if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
                                const jwt = bearerToken.slice(7, bearerToken.length);
                                setAuthenticationToken(jwt, parseBool(rememberMe, false))
                                return jwt;
                            }
                        }
                    })
                }    
            }
        });    
    }
    
    logout() {
        removeAuthenticationToken()
        return Promise.resolve()                
    }

    stringToHex(str: string): string {
        let arr = []; // []
        _.forEach(str, c => {
            const hex = Number(c.charCodeAt(0)).toString(16);
            arr.push(hex);  
        })
        return arr.join('');
    }

    byteArrayToHex(byteArr: number): string {
        let rtn = ""
        _.forEach(byteArr, b => {
            rtn = rtn + hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
        })
        return rtn
    }

    encryptBySymmetricKey(key: Buffer, message: Buffer): string {
        var cipher = forge.cipher.createCipher('AES-ECB', [...key]);
        cipher.start({iv: ""});
        cipher.update(forge.util.createBuffer(message));
        cipher.finish();
        var encrypted = cipher.output;
        return encrypted.toHex();        
    }

    encryptByAsymmetricPublicKey(keyData: string, message: string): string {
        const pem = `-----BEGIN PUBLIC KEY-----${keyData}-----END PUBLIC KEY-----`
        const buffer = forge.util.createBuffer(hexToBuffer(message))
        const publicKey = forge.pki.publicKeyFromPem(pem);
        const encrypted = publicKey.encrypt(buffer.getBytes(), 'RSAES-PKCS1-V1_5');        
        return forge.util.bytesToHex(encrypted)
    }
}

export const authenticationService = new AuthenticationService();
