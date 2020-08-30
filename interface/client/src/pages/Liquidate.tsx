import React, { useContext } from "react";
import { BalanceContext } from "../stores/BalanceStore";
import { WalletContext } from "../stores/WalletStore";
import CkbValue from "../components/common/CkbValue";
import { Grid, CenteredRow, CenteredCol } from "../components/common/Grid";
import BorrowCellList from "../components/BorrowCellList";

const Page = () => {
  const { balanceState } = useContext(BalanceContext);
  const { walletState } = useContext(WalletContext);

  let balance: string | number = 0;

  if (
    walletState.activeAccount &&
    balanceState.ckbBalances[walletState.activeAccount.lockHash]
  ) {
    balance = balanceState.ckbBalances[
      walletState.activeAccount.lockHash
    ].toString();
  }

  return (
    <Grid>
      <CenteredRow>
        <CenteredCol>
          <h3><CkbValue amount={balance} showPlaceholder={!balance} /></h3>
        </CenteredCol>
        <CenteredCol>
          <BorrowCellList headerTitle="List of under water loans" />
        </CenteredCol>
      </CenteredRow>
    </Grid>
  );
};

export default Page;