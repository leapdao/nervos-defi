import _ from "lodash";
import React, { createContext, useReducer } from "react";

export interface PoolBalance {
  cCKB: bigint,
  CKB: bigint,
}

export interface State {
  poolBalance: bigint;
  poolDeposit: bigint;
}

export const initialState = {
  poolBalance: BigInt(0),
  poolDeposit: BigInt(0),
};

export enum PoolActions {
  SetPoolBalance = "setPoolBalance",
  SetPoolDeposit = "setPoolDeposit"
}

export const reducer = (state, action) => {
  switch (action.type) {
    case PoolActions.SetPoolBalance:
      return setPoolBalance(state, action.balance);

    case PoolActions.SetPoolDeposit:
      return setPoolDeposit(state, action.poolDeposit);
    
    default:
      return state;
  }
};

export const setPoolBalance = (state, balance) => {
  const newState = _.cloneDeep(state);
  newState.poolBalance = balance;
  return newState;
};

export const setPoolDeposit = (state, balance) => {
  const newState = _.cloneDeep(state);
  newState.poolDeposit = balance;
  console.log("Value of the new state", balance, newState);
  return newState;
};

export interface ContextProps {
  poolState: State;
  poolDispatch: any;
}

export const PoolContext = createContext({} as ContextProps);

export const PoolStore = ({ children }) => {
  const [poolState, poolDispatch] = useReducer(reducer, initialState);
  const value: ContextProps = { poolState, poolDispatch };
  return (
    <PoolContext.Provider value={value}>{children}</PoolContext.Provider>
  );
};
