// @flow
import _ from 'lodash';

import { PageResult, SortOrder } from 'shared/model';
import { SERVER_API_URL, SERVER_TIMEOUT_VALUE } from 'app/constant/ApplicationConstant';
import { AUTHENTICATION_TOKEN_HEADER, httpGet } from 'shared/util/networkUtil';
import { parseBool } from 'shared/util/lang';
import { hexToBuffer } from 'shared/util/stringUtil';
import { parseJwt, removeAuthenticationToken, setAuthenticationToken } from 'shared/util/sessionUtil';
import { MenuHierarchy } from 'app/model/security/menuHierarchy';

const contextPath = `${SERVER_API_URL}/api/user-profile/menus`

class UserProfileService {

    constructMainMenu(): Promise<MenuHierarchy> {
        const param = {}
        console.debug("UserService.getMenu()")
        return httpGet(`${contextPath}`, param).then(
            msg => {
                const menu = MenuHierarchy.fromJson(msg.json)
                const rtn = Promise.resolve(menu)
                return rtn
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }
        )
    }
}

export const userProfileService = new UserProfileService();
