import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './auth.dto';
import { compare, hash } from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) { }

  async signIn(loginDto: LoginDto) {
    const user = await this.validateLocalUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: { id: user.id, email: user.email, fullName: user.fullName },
      ...tokens,
      success: true,
      message: 'Login successful',
    }
  }

  async generateTokens(userId: string, email: string) {
    const payload = { email, sub: userId };

    const accessTokenExpiration = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME') || '7d';
    const refreshTokenExpiration = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME') || '30d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: accessTokenExpiration }),
      this.jwtService.signAsync(payload, { expiresIn: refreshTokenExpiration }),
    ]);

    const hashedRefreshToken = await hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateLocalUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id, email: user.email, fullName: user.fullName };
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken);

      // Find the user and verify the stored refresh token
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          fullName: true,
          refreshToken: true,
        },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Verify the refresh token matches the stored hash
      const isRefreshTokenValid = await compare(refreshToken, user.refreshToken);
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user.id, user.email);

      return {
        user: { id: user.id, email: user.email, fullName: user.fullName },
        ...tokens,
        success: true,
        message: 'Tokens refreshed successfully',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    try {
      // Clear the refresh token from the database
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      throw new UnauthorizedException('Logout failed');
    }
  }
}
