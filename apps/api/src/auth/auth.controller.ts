import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { Public } from "./decorators/public.decorators";
import { LoginDto, RegisterDto, RefreshTokenDto } from "./auth.dto";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { ApiResponse } from "@nestjs/swagger";
import { GoogleOauthGuard } from "./guards/google-oauth.guard";
import { ConfigService } from "@nestjs/config";
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private configService: ConfigService
  ) { }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const user = await this.usersService.registerUser(registerDto);
    const tokens = await this.authService.generateTokens(user.user.id, user.user.email);

    return res.json({
      user: { id: user.user.id, email: user.user.email, fullName: user.user.fullName },
      ...tokens,
      success: true,
      message: 'User registered successfully',
    })
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.signIn(loginDto);
  }

  @Public()
  @Post('refresh')
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  async logout(@Req() req) {
    return await this.authService.logout(req.user.id);
  }

  @UseGuards(GoogleOauthGuard)
  @Get('google')
  async googleAuth() { }

  @UseGuards(GoogleOauthGuard)
  @Get('google/callback')
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const user = req.user
    const tokens = await this.authService.generateTokens(req.user.id, req.user.email);
    return res.redirect(`${this.configService.get('FRONTEND_URL')}/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
  }
}