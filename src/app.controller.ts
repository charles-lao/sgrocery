import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { getUserInfo } from './utils';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  homePage(@Req() req: Request, @Res() res: Response) {
    return res.render('home', getUserInfo(req));
  }

  @Get('signin')
  signinPage(@Req() req: Request, @Res() res: Response) {
    if (req['user']) {
      return res.redirect('/');
    }

    return res.render('signin', {
      hideNav: true,
    });
  }

  @Get('register')
  registerPage(@Req() req: Request, @Res() res: Response) {
    if (req['user']) {
      return res.redirect('/');
    }

    return res.render('register', {
      hideNav: true,
    });
  }
}
