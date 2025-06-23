import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID as string,
      clientSecret: process.env.FACEBOOK_APP_SECRET as string,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL as string,
      profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
      scope: ['email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user?: any) => void,
  ): Promise<any> {
    const { id, emails, displayName, photos } = profile;
    const user = {
      provider: 'facebook',
      providerId: id,
      email: emails && emails[0]?.value,
      name: displayName,
      avatar: photos && photos[0]?.value,
    };
    done(null, user);
  }
} 