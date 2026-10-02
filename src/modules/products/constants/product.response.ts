import { ResponseError } from '../../common/dtos/common.response.dto';

export class ProductException {
  static NOT_FOUND() {
    return new ResponseError({
      statusCode: 404,
      message: 'Product not found',
      messageCode: 'product.error.notFound',
    });
  }

  static SLUG_EXISTED() {
    return new ResponseError({
      statusCode: 409,
      message: 'Slug already exists',
      messageCode: 'product.error.slugExisted',
    });
  }

  static SKU_EXISTED(skus: string[]) {
    return new ResponseError({
      statusCode: 409,
      message: `SKU already exists: ${skus.join(', ')}`,
      messageCode: 'product.error.skuExisted',
      data: { skus },
    });
  }

  static VARIANT_NOT_FOUND() {
    return new ResponseError({
      statusCode: 404,
      message: 'Variant not found in this product',
      messageCode: 'product.error.variantNotFound',
    });
  }

  static INVALID_VARIANTS(message: string) {
    return new ResponseError({
      message,
      messageCode: 'product.error.invalidVariants',
    });
  }
}
