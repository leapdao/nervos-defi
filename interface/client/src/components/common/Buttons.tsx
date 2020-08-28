import React from "react";
import { Button } from "./Form";

export const ActionButton = (props) => {
  const { children, onClick } = props;

  return (
        <Button onClick={onClick}>
            {children}
        </Button>
  );
};

export const InactiveButton = (props) => {
  const { children } = props;

  return (
        <Button>
            {children}
        </Button>
  );
};