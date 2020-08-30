import React, { useContext } from "react";
import { BalanceContext } from "../stores/BalanceStore";
import { WalletContext } from "../stores/WalletStore";
import { TransactionStatusList } from "../components/TransactionStatusList";
import DepositForm from "../components/DepositForm";
import WithdrawForm from "../components/WithdrawForm";
import { Grid, Row, Col } from "../components/common/Grid";

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
      <Row>
        <Col>
          <DepositForm amount={balance} />
        </Col>
        <Col>
          <WithdrawForm />
        </Col>
      </Row>
      <Row>
      <TransactionStatusList />
      </Row>
    </Grid>
  );
};

export default Page;