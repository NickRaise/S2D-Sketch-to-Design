import prisma from "@db/prisma";
import { HttpError } from "../lib/errors/HttpError";
import { CreditBalance, CreditLedger } from "@db/prisma/types";

export const getCreditBalanceForUser = async (
  userId: string,
): Promise<CreditBalance | null> => {
  try {
    return await prisma.creditBalance.findUnique({ where: { userId } });
  } catch (error) {
    console.error("Error fetching credit balance:", error);
    throw HttpError.InternalServerError("Error fetching credit balance");
  }
};

export const getCreditLedgerForUser = async (
  userId: string,
): Promise<CreditLedger[]> => {
  try {
    return await prisma.creditLedger.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching credit ledger:", error);
    throw HttpError.InternalServerError("Error fetching credit ledger");
  }
};
