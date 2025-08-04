import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth2";
import { UsersService } from "src/users/users.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID') as string,
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET') as string,
      callbackURL: configService.get('GOOGLE_CALLBACK_URL') as string,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { emails, name } = profile;
    let existingUser = await this.usersService.findUserByEmail(emails[0].value);
    let response;
    if (!existingUser) {
      // If user does not exist, create a new user
      response = await this.usersService.registerUser({
        email: emails[0].value,
        fullName: name.givenName + ' ' + name.familyName,
        password: ''
      });
      existingUser = response.user;
    }

    done(null, existingUser);
  }
}