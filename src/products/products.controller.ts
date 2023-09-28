import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { Roles } from 'src/auth/roles.decorator';
import { AuthFilter } from 'src/auth/auth.filter';
import { getUserInfo } from 'src/utils';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(['admin'])
  @UseInterceptors(FileInterceptor('image'))
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() image: Express.Multer.File,
    @Res() res: Response,
  ) {
    const product = await this.productsService.create(createProductDto, image);

    return res
      .header({
        'HX-Redirect': `/products/product/${product.id}`,
      })
      .send();
  }

  @Get('all/:page')
  async findAll(@Param('page') page: string, @Res() res: Response) {
    const take = 10;
    const parsedPage = parseInt(page);
    const { count, products } = await this.productsService.findAll(
      take * (parsedPage - 1),
      take,
    );

    const totalPages = Math.ceil(count / take);

    return res.render('partials/products.html', {
      pages: Array.from({ length: totalPages }, (_, i) => i + 1),
      page: parsedPage,
      products,
      layout: null,
    });
  }

  @Roles(['admin'])
  @UseInterceptors(FileInterceptor('image'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() image: Express.Multer.File,
    @Res() res: Response,
  ) {
    await this.productsService.update(id, updateProductDto, image);

    return res
      .header({
        'HX-Redirect': `/products/product/${id}`,
      })
      .send();
  }

  @Roles(['admin'])
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.productsService.remove(id);
    return res
      .header({
        'HX-Redirect': '/',
      })
      .send();
  }

  //pages
  @Get('product/:id')
  async productPage(
    @Req() req: Request,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const product = await this.productsService.findOne(id);

      if (!product) {
        throw new NotFoundException();
      }

      return res.render('product', {
        ...product,
        ...getUserInfo(req),
        id,
      });
    } catch (error) {
      console.log('error:');
      console.error(error);
      return res.render('not-found');
    }
  }

  @UseFilters(AuthFilter)
  @Roles(['admin'])
  @Get('add')
  addProductPage(@Req() req: Request, @Res() res: Response) {
    return res.render('add-product', {
      buttonLabel: 'Add',
      method: 'post',
      url: '/products',
      ...getUserInfo(req),
    });
  }

  @Get('update/:id')
  async updateProductPage(
    @Req() req: Request,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const product = await this.productsService.findOne(id);

      if (!product) {
        throw new NotFoundException();
      }

      return res.render('update-product', {
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        image: product.image,
        buttonLabel: 'Update',
        method: 'patch',
        url: `/products/${id}`,
        ...getUserInfo(req),
      });
    } catch (error) {
      console.log('error:');
      console.error(error);
      return res.render('not-found');
    }
  }
}
