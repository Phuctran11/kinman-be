import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { TransactionEntity } from "../entities/transaction.entity";
import { CreateTransactionDto, TransactionFilterDto, UpdateTransactionDto } from "../dtos/transaction.dto";
import { WalletsService } from "../../wallets/services/wallets.service";
import { CategoriesService } from "../../categories/services/categories.service";
import { GroupsService } from "../../groups/services/groups.service";
import { TransactionSplitEntity } from "../entities/transaction-split.entity";

import { CategoryType } from "../../categories/entities/category.entity";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    @InjectRepository(TransactionEntity)
    private readonly transactionRepo: Repository<TransactionEntity>,
    @InjectRepository(TransactionSplitEntity)
    private readonly splitRepo: Repository<TransactionSplitEntity>,
    private readonly walletsService: WalletsService,
    private readonly categoriesService: CategoriesService,
    private readonly groupsService: GroupsService,
  ) {}

  async create(userId: string, dto: CreateTransactionDto) {
    const category = dto.categoryId ? await this.categoriesService.findOne(dto.categoryId, userId) : undefined;
    const wallet = dto.walletId ? await this.walletsService.findOne(dto.walletId, userId) : undefined;
    let group: any = undefined;
    if (dto.groupId) {
      group = await this.groupsService.findOne(dto.groupId, userId);
    }

    const transaction = this.transactionRepo.create({
      ...dto,
      user: { id: userId },
      category,
      wallet,
      group,
    });

    if (dto.splits && dto.splits.length > 0) {
      transaction.splits = dto.splits.map(s => this.splitRepo.create({
        amount: s.amount,
        user: { id: s.userId }
      }));
    }

    await this.transactionRepo.save(transaction);

    // Update wallet balance
    const amount = category?.type === CategoryType.INCOME ? dto.amount : -dto.amount;
    if (wallet) {
      await this.walletsService.updateBalance(wallet.id, amount);
    }
    return transaction;
  }

  async findAll(userId: string, filter: TransactionFilterDto) {
    const where: any = { user: { id: userId } };

    if (filter.startDate && filter.endDate) {
      where.date = Between(new Date(filter.startDate), new Date(filter.endDate));
    }
    if (filter.categoryId) {
      where.category = { id: filter.categoryId };
    }
    if (filter.walletId) {
      where.wallet = { id: filter.walletId };
    }

    return this.transactionRepo.find({
      where,
      relations: ["category", "wallet"],
      order: { date: "DESC" },
    });
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.transactionRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ["category", "wallet"],
    });
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }
    return transaction;
  }

  // TODO: Implement update logic with balance adjustment
  async update(id: string, userId: string, dto: UpdateTransactionDto) {
    const transaction = await this.findOne(id, userId);
    // Complex logic needed for balance update if amount/wallet changes
    // For now, just update fields
    return this.transactionRepo.save({
      ...transaction,
      ...dto,
    });
  }

  async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);

    // Revert balance
    const amount = transaction.category.type === CategoryType.INCOME ? -transaction.amount : transaction.amount;
    await this.walletsService.updateBalance(transaction.wallet.id, amount);

    return this.transactionRepo.softRemove(transaction);
  }
}
