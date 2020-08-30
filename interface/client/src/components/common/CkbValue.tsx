import React from "react";
import { formatBalance } from "../../utils/formatters";

interface Props {
  amount: string | number;
  showPlaceholder?: boolean;
}

const CkbValue = (props: Props) => {
  if (props.showPlaceholder) {
    return <React.Fragment> 0 - CKB</React.Fragment>;
  } else if (props.amount) {
    return <React.Fragment>{formatBalance(props.amount.toString())} CKB</React.Fragment>;
  } else {
    throw new Error('CkbValue component requires either a valid amount or the showPlaceholder flag');
  }
};

export default CkbValue;
