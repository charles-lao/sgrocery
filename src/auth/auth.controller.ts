import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/signin.dto';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('signin')
  async signin(@Body() body: SignInDto, @Res() res: Response) {
    try {
      const token = await this.authService.signIn(body);

      res.cookie('token', token, {
        httpOnly: true,
      });

      return res
        .header({
          'HX-Redirect': '/',
        })
        .send();
    } catch (error) {
      return res.render('partials/error-alert', {
        message: 'Invalid username/password!',
      });
    }
  }

  @Post('signout')
  async signout(@Req() req: Request, @Res() res: Response) {
    // Get a list of all cookie names
    const cookieNames = Object.keys(req.cookies);

    // Iterate through each cookie and clear it
    cookieNames.forEach((cookieName) => {
      res.clearCookie(cookieName);
    });

    res
      .header({
        'HX-Redirect': '/signin',
      })
      .send();
  }

  @Post('register')
  async register(@Body() body: CreateUserDto, @Res() res: Response) {
    const user = await this.userService.findOne(body.username);

    if (user) {
      return res.render('partials/error-alert', {
        message: 'Username already in use!',
        layout: null,
      });
    }

    await this.userService.register(body);

    return res
      .header({
        'HX-Redirect': '/signin',
      })
      .send();
  }
}
