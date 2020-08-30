import React from "react";
import { HashRouter, Redirect, Route, Switch, Link } from "react-router-dom";
import styled from "styled-components";
import "./App.css";
import Header from "./components/Header";
import WalletModal from "./components/WalletModal";
import * as dotenv from "dotenv";
import { ModalStore } from "./stores/ModalStore";
import { BalanceStore } from "./stores/BalanceStore";
import { WalletStore } from "./stores/WalletStore";
import { DataManager } from "./components/DataManager";
import { TxTrackerStore } from "./stores/TxTrackerStore";
import { PoolStore } from "./stores/PoolStore";

import Account from "./pages/Account";
import Borrow from "./pages/Borrow";
import Lend from "./pages/Lend";
import Liquidate from "./pages/Liquidate";

dotenv.config();
const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const ContentWrapper = styled.div`
  margin: 0 auto;
`;

const NavBar = styled.ul`
  list-style: none;
  padding: 20px;
  margin: 0;
  text-align: center;
`;

const Nav = styled.li`
  display: inline-block;
  width: 20%;
`;

function App() {
  return (
    <BalanceStore>
      <PoolStore>
        <WalletStore>
          <ModalStore>
            <TxTrackerStore>
              <DataManager>
                <div className="App">
                  <div className="app-shell">
                    <Header />
                    <WalletModal />
                    <Container>
                      <ContentWrapper>
                        <HashRouter>
                          <NavBar>
                            <Nav>
                              <Link to="/account">Account</Link>
                            </Nav>
                            <Nav>
                              <Link to="/borrow">Borrow</Link>
                            </Nav>
                            <Nav>
                              <Link to="/lend">Lend</Link>
                            </Nav>
                            <Nav>
                              <Link to="/liquidate">Liquidate</Link>
                            </Nav>
                          </NavBar>
                          <Switch>
                            <Route path="/account" component={Account} />
                            <Route path="/borrow" component={Borrow} />
                            <Route path="/lend" component={Lend} />
                            <Route path="/liquidate" component={Liquidate} />
                            <Redirect from="/" to="/lend" />
                          </Switch>
                        </HashRouter>
                      </ContentWrapper>
                    </Container>
                  </div>
                </div>
              </DataManager>
            </TxTrackerStore>
          </ModalStore>
        </WalletStore>
      </PoolStore>
    </BalanceStore>
  );
}

export default App;
