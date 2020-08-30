import { useContext, useEffect } from "react";

import { BalanceContext, BalanceActions } from "../stores/BalanceStore";
import { WalletContext } from "../stores/WalletStore";
import { PoolContext, PoolActions } from "../stores/PoolStore";
import { dappService } from "../services/DappService";
import React from "react";
import { useInterval } from "../hooks/useInterval";
import {
  TxTrackerContext,
  getPendingTx,
  TxTrackerActions,
} from "../stores/TxTrackerStore";

/* The DataManager fetches new data when it's needed. This takes the burden off the other components to handle data fetches, and placing that data in appropriate stores. Other components simply tell the fetcher the relevant update, and subscribe to the incoming state via contexts :) */
export const DataManager = ({ children }) => {
  const { balanceDispatch } = useContext(BalanceContext);
  const { walletState } = useContext(WalletContext);
  const { poolDispatch } = useContext(PoolContext);
  const { txTrackerState, txTrackerDispatch } = useContext(TxTrackerContext);

  const { activeAccount } = walletState;

  const fetchPoolBalance = async (poolDispatch) => {
    try {
      const balance = await dappService.fetchPoolBalance();
      poolDispatch({
        type: PoolActions.SetPoolBalance,
        balance: balance.CKB,
      });
    } catch (error) {
      console.warn("fetchPoolBalance", error);
    };
  }

  const fetchCkbBalance = async (activeAccount, balanceDispatch, poolDispatch) => {
    if (activeAccount) {
      try {
        const balance = await dappService.fetchCkbBalance(
          activeAccount.lockScript
        );

        const depositBalance = await dappService.fetchDepositBalance(activeAccount.lockScript.args);

        console.log("Balance from ", depositBalance);
        poolDispatch({
          type: PoolActions.SetPoolDeposit,
          poolDeposit: depositBalance,
        });

        balanceDispatch({
          type: BalanceActions.SetCkbBalance,
          lockHash: activeAccount.lockHash,
          balance,
        });
      } catch (error) {
        console.warn("fetchCkbBalance", error);
      }
    }
  };

  // Fetch CKB Balance on active account change
  useEffect(() => {
    if (activeAccount) {
      (async () => {
        await fetchPoolBalance(poolDispatch);
        await fetchCkbBalance(activeAccount, balanceDispatch,poolDispatch);
      })();
    }
  }, [activeAccount, balanceDispatch, poolDispatch]);

  // Fetch tracked transaction status + ckb balance on block update
  useInterval(async () => {
    const latestBlock = await dappService.getLatestBlock();

    if (latestBlock > txTrackerState.lastFetchedBlock) {
      console.log("latestBlock", latestBlock);
      console.log("activeAccount", activeAccount);
      txTrackerDispatch({
        type: TxTrackerActions.SetLatestBlock,
        latestBlock,
      });

      const pendingTx = getPendingTx(txTrackerState.trackedTx);

      if (pendingTx.length > 0) {
        dappService.fetchTransactionStatuses(pendingTx).then((txStatuses) => {
          txTrackerDispatch({
            type: TxTrackerActions.SetStatuses,
            txMap: txStatuses,
          });
        });
      }
      if (activeAccount) {
        fetchCkbBalance(activeAccount, balanceDispatch, poolDispatch);
      }
      fetchPoolBalance(poolDispatch);
    }
  }, 1000);

  return <React.Fragment>{children}</React.Fragment>;
};
