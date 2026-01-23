import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto, WechatLoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private i18n: I18nService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        this.i18n.t('auth.username_or_password_error'),
      );
    }

    if (!user.password) {
      throw new UnauthorizedException(
        this.i18n.t('auth.username_or_password_error'),
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        this.i18n.t('auth.username_or_password_error'),
      );
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException(this.i18n.t('auth.account_disabled'));
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const roles = user.userRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      code: ur.role.code,
      permissions: ur.role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        code: rp.permission.code,
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
    }));

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        roles,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: registerDto.username }, { email: registerDto.email }],
      },
    });

    if (existingUser) {
      throw new UnauthorizedException(
        this.i18n.t('auth.username_or_email_exists'),
      );
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        email: registerDto.email,
        password: hashedPassword,
        nickname: registerDto.nickname || registerDto.username,
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async validateToken(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException(
        this.i18n.t('auth.user_not_found_or_disabled'),
      );
    }

    return user;
  }

  /**
   * 获取微信授权 URL
   */
  getWechatAuthUrl(redirectUri: string, state?: string): string {
    const appId = this.configService.get<string>('WECHAT_APP_ID');
    if (!appId) {
      throw new BadRequestException(this.i18n.t('auth.wechat_not_configured'));
    }

    const encodedRedirectUri = encodeURIComponent(redirectUri);
    const stateParam = state ? `&state=${encodeURIComponent(state)}` : '';
    
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=snsapi_userinfo${stateParam}#wechat_redirect`;
  }

  /**
   * 通过 code 换取微信 access_token
   */
  async getWechatAccessToken(code: string): Promise<{
    access_token: string;
    expires_in: number;
    refresh_token: string;
    openid: string;
    scope: string;
    unionid?: string;
  }> {
    const appId = this.configService.get<string>('WECHAT_APP_ID');
    const appSecret = this.configService.get<string>('WECHAT_APP_SECRET');

    if (!appId || !appSecret) {
      throw new BadRequestException(this.i18n.t('auth.wechat_not_configured'));
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<{
          access_token: string;
          expires_in: number;
          refresh_token: string;
          openid: string;
          scope: string;
          unionid?: string;
          errcode?: number;
          errmsg?: string;
        }>(
          `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`,
        ),
      );

      if (response.data.errcode) {
        throw new UnauthorizedException(
          response.data.errmsg || this.i18n.t('auth.wechat_auth_failed'),
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        this.i18n.t('auth.wechat_auth_failed'),
      );
    }
  }

  /**
   * 通过 access_token 获取微信用户信息
   */
  async getWechatUserInfo(
    accessToken: string,
    openid: string,
  ): Promise<{
    openid: string;
    nickname: string;
    sex: number;
    province: string;
    city: string;
    country: string;
    headimgurl: string;
    privilege: string[];
    unionid?: string;
  }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{
          openid: string;
          nickname: string;
          sex: number;
          province: string;
          city: string;
          country: string;
          headimgurl: string;
          privilege: string[];
          unionid?: string;
          errcode?: number;
          errmsg?: string;
        }>(
          `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`,
        ),
      );

      if (response.data.errcode) {
        throw new UnauthorizedException(
          response.data.errmsg || this.i18n.t('auth.wechat_userinfo_failed'),
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        this.i18n.t('auth.wechat_userinfo_failed'),
      );
    }
  }

  /**
   * 微信登录
   */
  async wechatLogin(wechatLoginDto: WechatLoginDto) {
    // 1. 通过 code 换取 access_token
    const tokenData = await this.getWechatAccessToken(wechatLoginDto.code);

    // 2. 获取用户信息
    const wechatUserInfo = await this.getWechatUserInfo(
      tokenData.access_token,
      tokenData.openid,
    );

    // 3. 查找或创建用户
    let user = await this.prisma.user.findUnique({
      where: { wechatOpenId: wechatUserInfo.openid },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      // 创建新用户
      user = await this.prisma.user.create({
        data: {
          wechatOpenId: wechatUserInfo.openid,
          wechatUnionId: wechatUserInfo.unionid || tokenData.unionid,
          wechatNickname: wechatUserInfo.nickname,
          wechatAvatar: wechatUserInfo.headimgurl,
          nickname: wechatUserInfo.nickname,
          avatar: wechatUserInfo.headimgurl,
          // 生成默认用户名和邮箱（如果不存在）
          username: `wechat_${wechatUserInfo.openid.substring(0, 8)}`,
          email: `wechat_${wechatUserInfo.openid}@wechat.local`,
          status: 'active',
        },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } else {
      // 更新用户信息
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          wechatUnionId: wechatUserInfo.unionid || tokenData.unionid || user.wechatUnionId,
          wechatNickname: wechatUserInfo.nickname,
          wechatAvatar: wechatUserInfo.headimgurl,
          nickname: wechatUserInfo.nickname || user.nickname,
          avatar: wechatUserInfo.headimgurl || user.avatar,
        },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException(this.i18n.t('auth.account_disabled'));
    }

    // 4. 生成 JWT token
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const roles = user.userRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      code: ur.role.code,
      permissions: ur.role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        code: rp.permission.code,
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
    }));

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        roles,
      },
    };
  }
}
