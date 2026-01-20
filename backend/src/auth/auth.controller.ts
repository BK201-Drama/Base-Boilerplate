import { Controller, Post, Body, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, WechatLoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Get('wechat/auth-url')
  async getWechatAuthUrl(@Query('redirectUri') redirectUri: string, @Query('state') state?: string) {
    const authUrl = this.authService.getWechatAuthUrl(redirectUri, state);
    return { authUrl };
  }

  @Public()
  @Post('wechat/login')
  async wechatLogin(@Body() wechatLoginDto: WechatLoginDto) {
    return this.authService.wechatLogin(wechatLoginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.authService.validateToken({ sub: req.user.id });
    const { password: _, ...result } = user;
    return result;
  }
}
