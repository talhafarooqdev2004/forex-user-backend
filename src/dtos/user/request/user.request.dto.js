export class CreateUserRequestDTO {
    constructor(request) {
        this.firstName = request.firstName;
        this.lastName = request.lastName;
        this.email = request.email;
        this.gender = request.gender;
        this.password = request.password;
    }

    toServiceFormat() {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email.toLowerCase(),
            gender: this.gender,
            password: this.password
        };
    }
}

export class UserLoginRequestDTO {
    constructor(request) {
        this.email = request.email;
        this.password = request.password;
    }

    toServiceFormat() {
        return {
            email: this.email,
            password: this.password,
        };
    }
}

export class UserGoogleAuthLoginRequestDTO {
    constructor(user) {
        this.googleId = user.id;
        this.displayName = user.displayName || user.name?.givenName && user.name?.familyName 
            ? `${user.name.givenName} ${user.name.familyName}` 
            : user.displayName || 'User';
        this.email = user.emails && user.emails.length > 0 
            ? user.emails[0].value 
            : user.email || null;
        // Extract profile picture from Google profile
        this.image = user.photos && user.photos.length > 0 
            ? user.photos[0].value 
            : null;
    }

    toServiceFormat() {
        return {
            googleId: this.googleId,
            displayName: this.displayName,
            email: this.email,
            image: this.image,
        };
    }
}

export class UpdateUserRequestDTO {
    constructor(data) {
        this.name = data.name;
        this.email = data.email;
    }
}