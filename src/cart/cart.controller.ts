import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthFilter } from 'src/auth/auth.filter';
import { Roles } from 'src/auth/roles.decorator';
import { getUserInfo } from '../utils';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Req() req: Request, @Body() createCartDto: CreateCartItemDto) {
    createCartDto.userId = req['user'].sub;
    return this.cartService.create(createCartDto);
  }

  @Post('checkout')
  async checkout(@Body() body: any, @Res() res: Response) {
    const ids = Array.isArray(body.id) ? body.id : [body.id];
    await this.cartService.checkout(ids);
    return res
      .header({
        'HX-Redirect': '/cart/delivery',
      })
      .send();
  }

  @Patch('increment/:id')
  async incrementQuantity(@Param('id') id: string) {
    const { quantity, price } = await this.cartService.incrementQuantity(id);
    return `
    <div hx-swap-oob="innerHTML:#quantity-${id}">${quantity}</div>
    <div hx-swap-oob="innerHTML:#price-${id}">${price}</div>
    `;
  }

  @Patch('decrement/:id')
  async decrementQuantity(@Param('id') id: string) {
    const { quantity, price } = await this.cartService.decrementQuantity(id);
    return `
    <div hx-swap-oob="innerHTML:#quantity-${id}">${quantity}</div>
    <div hx-swap-oob="innerHTML:#price-${id}">${price}</div>
    `;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(id);
  }

  //pages
  @UseFilters(AuthFilter)
  @Roles(['customer'])
  @Get()
  async cartPage(@Req() req: Request, @Res() res: Response) {
    const cartItems = await this.cartService.findAll(
      req['user'].sub,
      'in_cart',
    );
    return res.render('cart', { cartItems, ...getUserInfo(req) });
  }

  @UseFilters(AuthFilter)
  @Roles(['customer'])
  @Get('delivery')
  async deliveryPage(@Req() req: Request, @Res() res: Response) {
    const cartItems = await this.cartService.findAll(
      req['user'].sub,
      'for_delivery',
    );
    const total = cartItems.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0,
    );
    return res.render('delivery', {
      cartItems,
      total,
      address: req['user']?.address,
      ...getUserInfo(req),
    });
  }
}
