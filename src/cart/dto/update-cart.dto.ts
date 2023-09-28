import { PartialType } from '@nestjs/mapped-types';
import { CreateCartItemDto } from './create-cart.dto';

export class UpdateCartDto extends PartialType(CreateCartItemDto) {}
