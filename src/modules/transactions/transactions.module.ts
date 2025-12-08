import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TransactionEntity } from "./entities/transaction.entity";
import { AuthModule } from "../auth/auth.module";

import { TransactionsController } from "./controllers/transactions.controller";
import { TransactionsService } from "./services/transactions.service";
import { CategoriesModule } from "../categories/categories.module";
import { WalletsModule } from "../wallets/wallets.module";
import { TransactionSplitEntity } from "./entities/transaction-split.entity";
import { GroupsModule } from "../groups/groups.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, TransactionSplitEntity]),
    CategoriesModule,
    WalletsModule,
    AuthModule,
    GroupsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
