import React, { useContext } from "react";
import { BalanceContext } from "../stores/BalanceStore";
import { WalletContext } from "../stores/WalletStore";
import TransferCkbForm from "../components/TransferCkbForm";
import CkbValue from "../components/common/CkbValue";
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
          <h3>
            Your Ckb Balance:{" "}
            <CkbValue amount={balance} showPlaceholder={!balance} />
          </h3>
        </Col>
        <Col>
          <TransferCkbForm />
        </Col>
      </Row>
    </Grid>
  );
};

export default Page;