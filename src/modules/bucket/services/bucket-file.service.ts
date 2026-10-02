import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { PageDto } from '../../common/dtos/common.response.dto';
import { FILE_ENTITY } from '../constants/bucket.constant';
import { BucketException } from '../constants/bucket.response';
import { GetListFileDto } from '../dto/file.dto';
import { FileEntity } from '../entities/file.entity';
import { ICreateFile } from '../interfaces/bucket.interface';

@Injectable()
export class BucketFileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
  ) {}

  async create(data: ICreateFile) {
    const file = this.fileRepo.create(data);
    return await this.fileRepo.save(file);
  }

  async getList(query: GetListFileDto): Promise<PageDto<FileEntity>> {
    const {
      ids,
      keywords,
      isSubmitted,
      startCreatedAt,
      endCreatedAt,
      startUpdatedAt,
      endUpdatedAt,
      fieldOrder,
      orderBy,
      page,
      pageSize,
    } = query;

    // alias = tên entity để fieldOrder (`${FILE_ENTITY}.<field>`) dùng thẳng được
    const qb = this.fileRepo
      .createQueryBuilder(FILE_ENTITY)
      .orderBy(fieldOrder, orderBy)
      .skip(query.skip)
      .take(query.limit);

    if (ids?.length) {
      qb.andWhere(`${FILE_ENTITY}.id IN (:...ids)`, { ids });
    }
    if (isSubmitted !== undefined) {
      qb.andWhere(`${FILE_ENTITY}.isSubmitted = :isSubmitted`, { isSubmitted });
    }
    this.whereDateRange(qb, 'createdAt', startCreatedAt, endCreatedAt);
    this.whereDateRange(qb, 'updatedAt', startUpdatedAt, endUpdatedAt);

    // mỗi keyword là 1 điều kiện OR theo fileName
    if (keywords?.length) {
      qb.andWhere(
        new Brackets((sub) =>
          keywords.forEach((keyword, index) =>
            sub.orWhere(`${FILE_ENTITY}.fileName ILIKE :keyword${index}`, {
              [`keyword${index}`]: `%${keyword}%`,
            }),
          ),
        ),
      );
    }

    const [items, totalItems] = await qb.getManyAndCount();

    return new PageDto({
      items,
      metadata: { page, pageSize, totalItems },
    });
  }

  private whereDateRange(
    qb: SelectQueryBuilder<FileEntity>,
    field: 'createdAt' | 'updatedAt',
    start?: Date,
    end?: Date,
  ) {
    if (start) {
      qb.andWhere(`${FILE_ENTITY}.${field} >= :${field}Start`, {
        [`${field}Start`]: start,
      });
    }
    if (end) {
      qb.andWhere(`${FILE_ENTITY}.${field} <= :${field}End`, {
        [`${field}End`]: end,
      });
    }
  }

  async findOne(id: string) {
    const file = await this.fileRepo.findOne({ where: { id } });

    if (!file) {
      throw BucketException.FILE_NOT_FOUND_IN_DB();
    }

    return file;
  }

  async submit(id: string) {
    await this.fileRepo.update(id, { isSubmitted: true });
    return this.findOne(id);
  }

  async delete(id: string) {
    await this.fileRepo.delete(id);
  }
}
