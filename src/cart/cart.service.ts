import { Injectable } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CartItem } from './entities/cart.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
  ) {}

  async create(createCartItemDto: CreateCartItemDto) {
    const cartItem = await this.cartItemsRepository.findOne({
      where: {
        status: 'in_cart',
        userId: createCartItemDto.userId,
        productId: createCartItemDto.productId,
      },
    });

    if (cartItem) {
      cartItem.quantity += parseInt(createCartItemDto.quantity as any);
      await this.cartItemsRepository.update(cartItem.id, {
        quantity: cartItem.quantity,
      });

      return cartItem;
    }

    return await this.cartItemsRepository.save({
      ...createCartItemDto,
      status: 'in_cart',
    });
  }

  async findAll(userId: string, status: string) {
    const cartItems = await this.cartItemsRepository.find({
      relations: {
        product: true,
      },
      where: { userId, status },
    });

    return cartItems.map((item) => ({
      ...item,
      price: item.quantity * item.product.price,
    }));
  }

  async incrementQuantity(id: string) {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id },
      relations: { product: true },
    });

    if (cartItem) {
      cartItem.quantity += 1;
      await this.cartItemsRepository.update(cartItem.id, {
        quantity: cartItem.quantity,
      });

      return {
        quantity: cartItem.quantity,
        price: cartItem.quantity * cartItem.product.price,
      };
    }

    return { quantity: 1, price: 0 };
  }

  async decrementQuantity(id: string) {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id },
      relations: { product: true },
    });

    if (cartItem) {
      cartItem.quantity -= 1;
      cartItem.quantity = cartItem.quantity <= 0 ? 1 : cartItem.quantity;
      await this.cartItemsRepository.update(cartItem.id, {
        quantity: cartItem.quantity,
      });

      return {
        quantity: cartItem.quantity,
        price: cartItem.quantity * cartItem.product.price,
      };
    }

    return { quantity: 1, price: 0 };
  }

  async remove(id: string) {
    return await this.cartItemsRepository.delete(id);
  }

  async checkout(ids: string[]) {
    return await this.cartItemsRepository.update(
      { id: In(ids) },
      { status: 'for_delivery' },
    );
  }
}
