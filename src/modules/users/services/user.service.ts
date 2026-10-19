import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Brackets, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { FILE_ENTITY } from '../../bucket/constants/bucket.constant';
import { BucketFileService } from '../../bucket/services/bucket-file.service';
import { BucketService } from '../../bucket/services/bucket.service';
import { PageDto } from '../../common/dtos/common.response.dto';
import {
  ROLE_ENTITY,
  USER_ROLE_TABLE,
} from '../../rbac/constants/rbac.constant';
import { PASSWORD_SALT_ROUNDS, USER_ENTITY } from '../constants/user.constant';
import { UserException } from '../constants/user.response';
import { CreateUserDto, GetListUserDto, UpdateUserDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly bucketFileService: BucketFileService,
    private readonly bucketService: BucketService,
  ) {}

  // create
  async create(data: CreateUserDto): Promise<User> {
    const { password, ...rest } = data;

    await this.ensureEmailNotExisted(rest.email);
    await this.ensureAvatarExisted(rest.avatarFileId);

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
      roleIds,
      startCreatedAt,
      endCreatedAt,
      startUpdatedAt,
      endUpdatedAt,
      fieldOrder,
      orderBy,
      page,
      pageSize,
    } = query;

    // alias = tên entity để fieldOrder (`${USER_ENTITY}.<field>`) dùng thẳng được,
    // bảng join cũng đặt alias theo tên entity của nó
    const qb = this.userRepo
      .createQueryBuilder(USER_ENTITY)
      .leftJoinAndSelect(`${USER_ENTITY}.avatar`, FILE_ENTITY)
      .leftJoinAndSelect(`${USER_ENTITY}.userRoles`, USER_ROLE_TABLE)
      .leftJoinAndSelect(`${USER_ROLE_TABLE}.role`, ROLE_ENTITY)
      .orderBy(fieldOrder, orderBy)
      .skip(query.skip)
      .take(query.limit);

    if (statuses?.length) {
      qb.andWhere(`${USER_ENTITY}.status IN (:...statuses)`, { statuses });
    }
    // lọc qua subquery để vẫn trả đủ các role khác của user
    if (roleIds?.length) {
      qb.andWhere(
        `${USER_ENTITY}.id IN (SELECT user_id FROM ${USER_ROLE_TABLE} WHERE role_id IN (:...roleIds))`,
        { roleIds },
      );
    }
    this.whereDateRange(qb, 'createdAt', startCreatedAt, endCreatedAt);
    this.whereDateRange(qb, 'updatedAt', startUpdatedAt, endUpdatedAt);

    // mỗi keyword tìm theo email / fullName / phone (OR)
    if (keywords?.length) {
      qb.andWhere(
        new Brackets((sub) =>
          keywords.forEach((keyword, index) =>
            (['email', 'fullName', 'phone'] as const).forEach((field) =>
              sub.orWhere(`${USER_ENTITY}.${field} ILIKE :keyword${index}`, {
                [`keyword${index}`]: `%${keyword}%`,
              }),
            ),
          ),
        ),
      );
    }

    const [items, totalItems] = await qb.getManyAndCount();
    items.forEach((item) => this.attachRoles(item));
    await Promise.all(
      items.map((item) => this.bucketService.attachUrlRead(item.avatar)),
    );

    return new PageDto({
      items,
      metadata: { page, pageSize, totalItems },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { avatar: true, userRoles: { role: true } },
    });

    if (!user) {
      throw UserException.NOT_FOUND();
    }
    await this.bucketService.attachUrlRead(user.avatar);
    this.attachRoles(user);

    return user;
  }

  // dùng cho auth: passwordHash để select: false nên phải addSelect
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder(USER_ENTITY)
      .addSelect(`${USER_ENTITY}.passwordHash`)
      .where(`${USER_ENTITY}.email = :email`, { email })
      .getOne();
  }

  async findOneWithPassword(id: string): Promise<User> {
    const user = await this.userRepo
      .createQueryBuilder(USER_ENTITY)
      .addSelect(`${USER_ENTITY}.passwordHash`)
      .where(`${USER_ENTITY}.id = :id`, { id })
      .getOne();

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
    await this.ensureAvatarExisted(rest.avatarFileId);

    await this.userRepo.update(id, {
      ...rest,
      ...(password && {
        passwordHash: await hash(password, PASSWORD_SALT_ROUNDS),
      }),
    });

    return this.findOne(id);
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.userRepo.update(id, {
      passwordHash: await hash(password, PASSWORD_SALT_ROUNDS),
    });
  }

  async markEmailVerified(id: string): Promise<void> {
    await this.userRepo.update(id, { emailVerifiedAt: new Date() });
  }

  // delete
  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.userRepo.delete(id);
  }

  // helpers
  // API trả user.roles (danh sách role), ẩn bảng nối userRoles
  private attachRoles(user: User) {
    user.roles = user.userRoles?.map((userRole) => userRole.role) ?? [];
    delete user.userRoles;
  }

  private async ensureAvatarExisted(avatarFileId?: string | null) {
    if (avatarFileId) {
      await this.bucketFileService.findOne(avatarFileId);
    }
  }

  private async ensureEmailNotExisted(email: string, excludeId?: string) {
    const existed = await this.userRepo.exists({
      where: { email, ...(excludeId && { id: Not(excludeId) }) },
    });

    if (existed) {
      throw UserException.EMAIL_EXISTED();
    }
  }

  private whereDateRange(
    qb: SelectQueryBuilder<User>,
    field: 'createdAt' | 'updatedAt',
    start?: Date,
    end?: Date,
  ) {
    if (start) {
      qb.andWhere(`${USER_ENTITY}.${field} >= :${field}Start`, {
        [`${field}Start`]: start,
      });
    }
    if (end) {
      qb.andWhere(`${USER_ENTITY}.${field} <= :${field}End`, {
        [`${field}End`]: end,
      });
    }
  }
}
