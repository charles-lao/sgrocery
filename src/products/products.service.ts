import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    { price, quantity, ...rest }: CreateProductDto,
    image: Express.Multer.File,
  ) {
    const res = await this.cloudinaryService.uploadImage(image);
    const product = {
      ...rest,
      image: res.secure_url,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
    };

    return await this.productsRepository.save(product);
  }

  async findAll(skip: number, take = 10) {
    const [products, count] = await this.productsRepository.findAndCount({
      skip,
      take,
    });
    return { products, count };
  }

  async findOne(id: string) {
    return await this.productsRepository.findOneBy({
      id,
    });
  }

  async update(
    id: string,
    { price, quantity, description, ...rest }: UpdateProductDto,
    image: Express.Multer.File,
  ) {
    const res = await this.cloudinaryService.uploadImage(image);

    const product = {
      ...rest,
      description: description.trim(),
      image: res.secure_url,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
    };

    return await this.productsRepository.update(id, product);
  }

  async remove(id: string) {
    return await this.productsRepository.delete(id);
  }
}
