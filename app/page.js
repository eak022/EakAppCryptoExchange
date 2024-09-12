"use client";
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
  Stack,
  Container,
  Card,
  CardContent,
  TextField,
  Box,
  IconButton,
  Divider,
} from "@mui/material";

import abi from "./abi.json";
import MenuIcon from "@mui/icons-material/Menu";

import { ethers } from "ethers";
import { formatEther, parseUnits } from "@ethersproject/units";

import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";

const [metaMask, hooks] = initializeConnector(
  (actions) => new MetaMask({ actions })
);
const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider } =
  hooks;
const contractChain = 11155111; 
const contractAddress = "0xc417c3eb7bba3E0902951422E272949838f82D01"; 

const getAddressTxt = (str, s = 6, e = 6) => {
  if (str) {
    return `${str.slice(0, s)}...${str.slice(str.length - e)}`;
  }
  return "";
};

export default function Page() {
  const chainId = useChainId();
  const accounts = useAccounts();
  const isActive = useIsActive();

  const provider = useProvider();
  const [error, setError] = useState(undefined);

  const [balance, setBalance] = useState("");
  useEffect(() => {
    const fetchBalance = async () => {
      const signer = provider.getSigner();
      // Create a new instance of the contract with address, ABI, and signer
      const smartContract = new ethers.Contract(contractAddress, abi, signer);
      const myBalance = await smartContract.balanceOf(accounts[0]);
      console.log(formatEther(myBalance));
      setBalance(formatEther(myBalance));
    };
    if (isActive) {
      fetchBalance();
    }
  }, [isActive, provider, accounts]);

  const [ETHValue, setETHValue] = useState(0);
  const handleBuy = async () => {
    if (ETHValue <= 0) {
      return;
    }

    const signer = provider.getSigner();
    const smartContract = new ethers.Contract(contractAddress, abi, signer);
    const weiValue = parseUnits(ETHValue.toString(), "ether");
    try {
      const tx = await smartContract.buy({
        value: weiValue.toString(),
      });
      console.log("Transaction hash:", tx.hash);
    } catch (error) {
      console.error("Transaction failed:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug("Failed to connect eagerly to MetaMask");
    });
  }, []);

  const handleConnect = () => {
    metaMask.activate(contractChain);
  };

  const handleDisconnect = () => {
    metaMask.resetState();
    alert(
      "To fully disconnect, please remove this site from MetaMask's connected sites by locking MetaMask."
    );
  };

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
             EakApp CryptoExchange
            </Typography>

            {!isActive ? (
              <Button variant="contained" onClick={handleConnect}>
                Connect
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Chip
                  label={getAddressTxt(accounts ? accounts[0] : "")}
                  variant="outlined"
                />

                <Button variant="contained" color="inherit" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </Stack>
            )}
          </Toolbar>
        </AppBar>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {isActive ? (
          <>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography>UDS</Typography>
                  <TextField label="Address" value={accounts ? accounts[0] : ""} />
                  <TextField label="UDS Balance" value={balance} />
                  <Divider />
                  <Typography>Buy UDS (1 ETH = 10 UDS)</Typography>
                  <TextField
                    label="ETH"
                    type="number"
                    onChange={(e) => setETHValue(e.target.value)}
                  />
                  <Button variant="contained" onClick={handleBuy}>
                    Buy
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </>
        ) : null}
      </Container>
    </div>
  );
}
