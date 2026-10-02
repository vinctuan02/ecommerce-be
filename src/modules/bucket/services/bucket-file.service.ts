import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  FindOperator,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { PageDto } from '../../common/dtos/common.response.dto';
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

    const baseWhere: FindOptionsWhere<FileEntity> = {
      id: ids?.length ? In(ids) : undefined,
      isSubmitted,
      createdAt: this.dateRange(startCreatedAt, endCreatedAt),
      updatedAt: this.dateRange(startUpdatedAt, endUpdatedAt),
    };

    // mỗi keyword là 1 điều kiện OR theo fileName
    const where = keywords?.length
      ? keywords.map((keyword) => ({
          ...baseWhere,
          fileName: ILike(`%${keyword}%`),
        }))
      : baseWhere;

    const [items, totalItems] = await this.fileRepo.findAndCount({
      where,
      order: { [fieldOrder]: orderBy },
      skip: query.skip,
      take: query.limit,
    });

    return new PageDto({
      items,
      metadata: { page, pageSize, totalItems },
    });
  }

  private dateRange(start?: Date, end?: Date): FindOperator<Date> | undefined {
    if (start && end) {
      return And(MoreThanOrEqual(start), LessThanOrEqual(end));
    }
    if (start) {
      return MoreThanOrEqual(start);
    }
    if (end) {
      return LessThanOrEqual(end);
    }
    return undefined;
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
