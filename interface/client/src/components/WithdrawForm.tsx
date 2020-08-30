import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  FormWrapper,
  FormLabel,
  FormTitle,
  FormInput,
  FormError,
  Form,
} from "./common/Form";
import { dappService } from "../services/DappService";
import { WalletContext } from "../stores/WalletStore";
import { getConfig } from "../config/lumosConfig";
import { toShannons } from "../utils/formatters";
import { walletService } from "../services/WalletService";
import {
  TxTrackerContext,
  TxTrackerActions,
  TxStatus,
} from "../stores/TxTrackerStore";
import { CenteredRow, CenteredCol } from "./common/Grid";
import { formatBalance } from "../utils/formatters";

type Inputs = {
  recipientAddress: string;
  amount: string;
};

interface Props {
  amount: string | bigint;
}

const DepositForm = (props: Props) => {
  const { walletState } = useContext(WalletContext);
  const { txTrackerDispatch } = useContext(TxTrackerContext);
  const [error, setError] = useState("");

  const defaultTxFee = getConfig().DEFAULT_TX_FEE;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { register, handleSubmit, watch, errors } = useForm<Inputs>();
  const onSubmit = async (formData) => {
    if (!walletState.activeAccount) return;

    try {
      const params = {
        sender: walletState.activeAccount.address,
        amount: toShannons(formData.amount),
        txFee: defaultTxFee,
      };

      const tx = await dappService.buildPoolWithdraw(params);

      const signatures = await walletService.signTransaction(
        tx,
        walletState.activeAccount.lockHash
      );
      const txHash = await dappService.transferWithdrawFromPool(params, signatures);

      setError("");

      txTrackerDispatch({
        type: TxTrackerActions.SetTrackedTxStatus,
        txHash,
        txStatus: TxStatus.PENDING,
      });
    } catch (e) {
      setError(e.toString());
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit(onSubmit)}>
      <Form style={{ minWidth: 450 }}>
        <FormTitle>Withdraw</FormTitle>
        <h3>Locked {formatBalance(props.amount.toString())} cCKB </h3>
        <CenteredRow>
          <CenteredCol>
            <FormLabel htmlFor="amount">Amount</FormLabel>
          </CenteredCol>
          <CenteredCol>
            <FormInput
              type="number"
              name="amount"
              step="0.00000001"
              ref={register({ required: true })}
            />
          </CenteredCol>
        </CenteredRow>
        {errors.amount && <FormError>Please enter amount</FormError>}
        <Button disabled={!walletState.activeAccount} type="submit">
          Withdraw
        </Button>
        {error.length > 0 && (
          <FormError>{error}</FormError>
        )}
      </Form>
    </FormWrapper>
  );
};

export default DepositForm;
