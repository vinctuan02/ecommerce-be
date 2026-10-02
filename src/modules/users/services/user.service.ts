import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import {
  And,
  FindOperator,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { PageDto } from '../../common/dtos/common.response.dto';
import { PASSWORD_SALT_ROUNDS } from '../constants/user.constant';
import { UserException } from '../constants/user.response';
import { CreateUserDto, GetListUserDto, UpdateUserDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // create
  async create(data: CreateUserDto): Promise<User> {
    const { password, ...rest } = data;

    await this.ensureEmailNotExisted(rest.email);

    const user = this.userRepo.create({
      ...rest,
      passwordHash: await hash(password, PASSWORD_SALT_ROUNDS),
    });
    const { id } = await this.userRepo.save(user);

    return this.findOne(id);
  }

  // read
  async getList(query: GetListUserDto): Promise<PageDto<User>> {
    const {
      keywords,
      statuses,
      startCreatedAt,
      endCreatedAt,
      startUpdatedAt,
      endUpdatedAt,
      fieldOrder,
      orderBy,
      page,
      pageSize,
    } = query;

    const baseWhere: FindOptionsWhere<User> = {
      status: statuses?.length ? In(statuses) : undefined,
      createdAt: this.dateRange(startCreatedAt, endCreatedAt),
      updatedAt: this.dateRange(startUpdatedAt, endUpdatedAt),
    };

    // mỗi keyword tìm theo email / fullName / phone (OR)
    const where = keywords?.length
      ? keywords.flatMap((keyword) =>
          (['email', 'fullName', 'phone'] as const).map((field) => ({
            ...baseWhere,
            [field]: ILike(`%${keyword}%`),
          })),
        )
      : baseWhere;

    const [items, totalItems] = await this.userRepo.findAndCount({
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

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw UserException.NOT_FOUND();
    }

    return user;
  }

  // update
  async update(id: string, data: UpdateUserDto): Promise<User> {
    const { password, ...rest } = data;

    await this.findOne(id);

    if (rest.email) {
      await this.ensureEmailNotExisted(rest.email, id);
    }

    await this.userRepo.update(id, {
      ...rest,
      ...(password && {
        passwordHash: await hash(password, PASSWORD_SALT_ROUNDS),
      }),
    });

    return this.findOne(id);
  }

  // delete
  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.userRepo.delete(id);
  }

  // helpers
  private async ensureEmailNotExisted(email: string, excludeId?: string) {
    const existed = await this.userRepo.exists({
      where: { email, ...(excludeId && { id: Not(excludeId) }) },
    });

    if (existed) {
      throw UserException.EMAIL_EXISTED();
    }
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
}
