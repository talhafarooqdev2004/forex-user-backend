export class UserResponseDTO {
    constructor(user) {
        this.id = user.id;
        this.firstName = user.firstName || user.first_name;
        this.lastName = user.lastName || user.last_name;
        this.email = user.email;
        this.gender = user.gender;
        this.phone = user.phone || null;
        this.image = user.image || null;
        this.createdAt = user.createdAt || user.created_at;
        this.updatedAt = user.updatedAt || user.updated_at;
    }

    static fromArray(users) {
        return users.map(user => new UserResponseDTO(user));
    }
}

export class UserLoginResponseDTO {
    constructor(token) {
        this.token = token;
    }
}