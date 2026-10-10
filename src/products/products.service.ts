import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private withDiscount<T extends { price: number; originalPrice: number | null }>(
    product: T,
  ) {
  
    const discount =
      product.originalPrice && product.price
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) *
              100,
          )
        : 0;
    return { ...product, discount };
  }

  private async ensureExists(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true }, 
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  // GET /api/products/flash-deals
  async getFlashDeals() {
    const products = await this.prisma.product.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { originalPrice: 'desc' },
      take: 8,
    });

    return { products: products.map((p) => this.withDiscount(p)) };
  }

  // GET /api/products
  async getProducts({ category, search, minPrice, maxPrice, sort }: GetProductsQueryDto) {

    const where: Prisma.ProductWhereInput = {};

    if (category && category !== 'all') where.category = category;

    if (search) where.name = { contains: search, mode: 'insensitive' };

    const price: Prisma.FloatFilter = {};
    if (minPrice) price.gte = minPrice; 
    if (maxPrice) price.lte = maxPrice; 
    if (minPrice || maxPrice) where.price = price;

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === 'price-low'
        ? { price: 'asc' }
        : sort === 'price-high'
          ? { price: 'desc' }
          : { createdAt: 'desc' };

    const products = await this.prisma.product.findMany({ where, orderBy });

    return { products: products.map((p) => this.withDiscount(p)) };
  }

  // GET /api/products/:id
  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found'); 
    }
    return { product: this.withDiscount(product) };
  }

  // POST /api/products
  async createProduct(dto: CreateProductDto) {
    const product = await this.prisma.product.create({ data: dto });
    return { product };
  }

  // PUT /api/products/:id
  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.ensureExists(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: dto,
    });
    return { product };
  }

  // DELETE /api/products/:id
  async deleteProduct(id: string) {
    await this.ensureExists(id);
    await this.prisma.product.update({
      where: { id },
      data: { stock: 0 },
    });
    return { message: 'Product Updated' };
  }
}