interface User {
    id: number | string;
    name: string;
    surname: string;
    login?: string;
    avatar?: string;
    password?: string;
}

class User implements User {
    id: number | string;
    name: string;
    surname: string;
    login?: string;
    avatar?: string;
    password?: string;

    constructor(id: number | string, name: string, surname: string, login?: string, avatar?: string, password?: string) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.login = login;
        this.avatar = avatar;
        this.password = password;
    }
}

export default User;