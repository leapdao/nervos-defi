import express from "express";
import { rpc } from "../index";
import { sealTransaction } from "@ckb-lumos/helpers";
import { buildDepositTx, getPoolBalance } from "../generators/pool";

const routes = express.Router();

routes.get("/get-balance", async (req: any, res) => {
  const { senderArgs } = req.body;
  try {
    const balance = await getPoolBalance();
    return res
      .status(200)
      .json(JSON.stringify({ balance }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/deposit-build", async (req: any, res) => {
  try {
    const txSkeleton = await buildDepositTx(req.body);
    return res
      .status(200)
      .json(JSON.stringify({ params: req.body, txSkeleton }));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/withdraw-build", async (req: any, res) => {
  try {
    const txSkeleton = await buildDepositTx(req.body);
    return res
      .status(200)
      .json(JSON.stringify({ params: req.body, txSkeleton }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/deposit-transfer", async (req: any, res) => {
  const { params, signatures } = req.body;
  try {
    const txSkeleton = await buildDepositTx(params);
    const tx = sealTransaction(txSkeleton, signatures);
    const txHash = await rpc.send_transaction(tx);
    return res.status(200).json(JSON.stringify({ txHash }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/withdraw-transfer", async (req: any, res) => {
  const { params, signatures } = req.body;
  try {
    const txSkeleton = await buildDepositTx(params);
    const tx = sealTransaction(txSkeleton, signatures);
    const txHash = await rpc.send_transaction(tx);
    return res.status(200).json(JSON.stringify({ txHash }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default routes;
