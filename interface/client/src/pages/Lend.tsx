import React, { useContext } from "react";
import { BalanceContext } from "../stores/BalanceStore";
import { WalletContext } from "../stores/WalletStore";
import { PoolContext} from "../stores/PoolStore";
import { TransactionStatusList } from "../components/TransactionStatusList";
import DepositForm from "../components/DepositForm";
import WithdrawForm from "../components/WithdrawForm";
import { Grid, Row, Col } from "../components/common/Grid";
import { formatBalance } from "../utils/formatters";

const Page = () => {
  const { balanceState } = useContext(BalanceContext);
  const { walletState } = useContext(WalletContext);
  const { poolState } = useContext(PoolContext);

  let balance: string | number = 0;
  let poolBalance = poolState.poolBalance;
  let poolDeposit = poolState.poolDeposit;

  console.log(poolBalance, poolDeposit);

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
          <div style={{ padding: 20, width: 450 }}>
            <p>Total CKB in Pool</p>
            { formatBalance(poolBalance.toString())} - CKB
          </div>
        </Col>
        <Col>
          <div style={{ padding: 20, width: 450 }}>
            <p>Total cCKB you hold</p>
            {formatBalance(poolDeposit.toString())} - cCKB
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <DepositForm amount={balance} />
        </Col>
        <Col>
          <WithdrawForm amount={poolDeposit} />
        </Col>
      </Row>
      <Row>
      <TransactionStatusList />
      </Row>
    </Grid>
  );
};

export default Page;