// @flow
export class MenuHierarchy {
    name: string;
    multiple: boolean;
    separator: boolean;
    url: string;
    subMenu: ?MenuHierarchy[]

    constructor(name: string, multiple: boolean, separator: boolean, url: string, subMenu: ?MenuHierarchy[]) {
        this.name = name;
        this.multiple = multiple;
        this.separator = separator;
        this.url = url;
        this.subMenu = subMenu;
    }

    static fromJson(json: Object): MenuHierarchy {
        const rtn = new MenuHierarchy("", false, false, "", null);
        Object.assign(rtn, json);
        return rtn
    }
}