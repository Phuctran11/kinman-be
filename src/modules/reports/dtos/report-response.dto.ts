export interface UserSummaryResponse {
    userId: string;
    userName: string;
    totalSpent: number;
    transactionCount: number;
    byCategory: CategorySummary[];
    byGroup: GroupSummary[];
    period: {
        from: string;
        to: string;
    };
}

export interface CategorySummary {
    categoryId: string;
    categoryName: string;
    amount: number;
    count: number;
}

export interface GroupSummary {
    groupId: string;
    groupName: string;
    amount: number;
    count: number;
}

export interface GroupReportResponse {
    groupId: string;
    groupName: string;
    totalExpenses: number;
    memberCount: number;
    members: MemberExpense[];
    debts: DebtSummary[];
    byCategory: CategorySummary[];
    period: {
        from: string;
        to: string;
    };
}

export interface MemberExpense {
    userId: string;
    userName: string;
    paid: number;
    owed: number;
    balance: number; // positive = người khác nợ, negative = mình nợ
}

export interface DebtSummary {
    debtorId: string;
    debtorName: string;
    creditorId: string;
    creditorName: string;
    amount: number;
    settled: boolean;
}
