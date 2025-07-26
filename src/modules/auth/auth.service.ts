import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthResponse } from './interface/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.usersService.getByEmail(email);
    if (user?.password !== password) {
      throw new UnauthorizedException();
    }

    const payload = {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      userInfo: payload,
    };
  }

  async register(data: CreateUserDto): Promise<AuthResponse> {
    const user = await this.usersService.create(data);

    const payload = {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      userInfo: payload,
    };
  }

  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token', error);
    }
  }

  extractTokenFromHeader(bearerToken: string): string | undefined {
    const [type, token] = bearerToken.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async getInformationLogged(bearerToken: string) {
    const token = this.extractTokenFromHeader(bearerToken);
    return await this.validateToken(token);
  }
}
