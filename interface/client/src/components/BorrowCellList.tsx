import React from "react";
import styled from "styled-components";
import { Col, Grid } from "./common/Grid";

const Wrapper = styled.div`
  border-radius: 5px;
`;

const TableRow = styled.div`
  display: flex;
  justify-content: center;
`;

const TableItemLeft = styled(Col)`
  padding: 10px 0px;
  border-left: 1px solid black;
`;

const TableItemRight = styled(Col)`
  padding: 10px 0px;
  border-left: 1px solid black;
  border-right: 1px solid black;
`;

const StatusWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const StatusItem = styled(Col)``;

interface BCell {
  txHash: string,
  token: string,
  amount: number,
  intrest: number,
  cToken: string,
  cAmount: number
}

interface Props {
  headerTitle: string;
}

const CellList = (props: Props) => {
  const ExampleCells: Array<BCell> = [
    {
      txHash: '0x904582039450234',
      token: 'CKB',
      amount: 200,
      intrest: 1.5,
      cToken: 'SUDT',
      cAmount: 890
    },
    {
      txHash: '0x948209384523409',
      token: 'SUDT',
      amount: 200,
      intrest: 1.5,
      cToken: 'CKB',
      cAmount: 890
    },
    {
      txHash: '0x290834509234908',
      token: 'CKB',
      amount: 200,
      intrest: 1.5,
      cToken: 'SUDT',
      cAmount: 890
    },
    {
      txHash: '0x728937459234898',
      token: 'SUDT',
      amount: 200,
      intrest: 1.5,
      cToken: 'CKB',
      cAmount: 890
    }
  ]

  const renderListItems = () => {
    return ExampleCells.map((cell: BCell) => {
      return (
        <React.Fragment key={cell.txHash}>
          <TableRow>
            <TableItemLeft size={3}>
              {cell.token} - {cell.amount}
            </TableItemLeft>
            <TableItemLeft size={3}>
              {cell.intrest}%
            </TableItemLeft>
            <TableItemLeft size={3}>
              {cell.cToken} - { cell.cAmount}
            </TableItemLeft>
            <TableItemRight size={3}>
              <StatusWrapper>
                <StatusItem>
                  OK
                </StatusItem>
              </StatusWrapper>
            </TableItemRight>
          </TableRow>
        </React.Fragment>
      );
    });
  };

  return (
    <Wrapper style={{ minWidth: 400, padding: 10}}>
        <React.Fragment>
          <h3>{props.headerTitle}</h3>
          <Grid>{renderListItems()}</Grid>
        </React.Fragment>
    </Wrapper>
  );
};


export default CellList;