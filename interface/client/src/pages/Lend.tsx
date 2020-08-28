import React from "react";
import { TransactionStatusList } from "../components/TransactionStatusList";
import DepositForm from "../components/DepositForm";
import WithdrawForm from "../components/WithdrawForm";
import { Grid, Row, Col } from "../components/common/Grid";

const Page = () => {
  return (
    <Grid>
      <Row>
        <Col>
          <DepositForm />
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