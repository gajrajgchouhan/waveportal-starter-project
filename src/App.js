import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

export default function App() {
    /**
     * we need to actually check if we're authorized to
     * actually access the user's wallet. Once we have
     * access to this, we can call our smart contract!
     */
    const [currentAccount, setCurrentAccount] = useState("");

    /**
     * Create a variable here that holds the contract address after you deploy!
     */
    const contractAddress = "0x1B12eE25a1d657F445D52ED1aFED140b33AD2e65";
    /**
     * Create a variable here that references the abi content!
     */
    const contractABI = abi.abi;

    const checkIfWalletIsConnected = async () => {
        /**
         * So, in order for our website to talk to the
         * blockchain, we need to somehow connect our wallet
         * to it. Once we connect our wallet to our website,
         * our website will have permissions to call smart
         * contracts on our behalf. Remember, it's just like
         * authenticating in to a website.
         */
        try {
            /*
             * First make sure we have access to window.ethereum
             */
            const { ethereum } = window;

            if (!ethereum) {
                console.log("Make sure you have metamask!");
            } else {
                console.log("We have the ethereum object", ethereum);
            }

            /*
             * Check if we're authorized to access the user's wallet
             */
            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);
            } else {
                console.log("No authorized account found");
            }
        } catch (error) {
            console.log(error);
        }
    };

    /**
     * Implement your connectWallet method here
     */
    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }

            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
        }
    };

    const wave = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                );

                let count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());

                /*
                 * Execute the actual wave from your smart contract
                 */
                const waveTxn = await wavePortalContract.wave();
                console.log("Mining...", waveTxn.hash);

                await waveTxn.wait();
                console.log("Mined -- ", waveTxn.hash);

                count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const [totalWaves, setTotalWaves] = useState(null);

    /*
     * This runs our function when the page loads.
     */
    useEffect(() => {
        checkIfWalletIsConnected();
        const totalWavesInterval = setInterval(async () => {
            try {
                const { ethereum } = window;

                if (ethereum) {
                    const provider = new ethers.providers.Web3Provider(
                        ethereum
                    );
                    const signer = provider.getSigner();
                    const wavePortalContract = new ethers.Contract(
                        contractAddress,
                        contractABI,
                        signer
                    );

                    let count = await wavePortalContract.getTotalWaves();
                    console.log(
                        "Retrieved total wave count...",
                        count.toNumber()
                    );
                    setTotalWaves(count.toNumber());
                } else {
                    console.log("Ethereum object doesn't exist!");
                }
            } catch (error) {
                console.log(error);
            }
        }, 2000);
        return () => {
            clearInterval(totalWavesInterval);
        };
    }, []);

    return (
        <div className="mainContainer">
            <div className="dataContainer">
                <div className="header">👋 Hey there!</div>

                <div className="bio">
                    I am farza and I worked on self-driving cars so that's
                    pretty cool right? Connect your Ethereum wallet and wave at
                    me!
                </div>

                <div className="bio">
                    {totalWaves} waves have been waved at me so far!
                </div>

                <button
                    className="waveButton"
                    disabled={currentAccount === ""}
                    onClick={wave}
                >
                    Wave at Me
                </button>

                {/*
                 * If there is no currentAccount render this button
                 */}
                {!currentAccount && (
                    <button className="waveButton" onClick={connectWallet}>
                        Connect Wallet
                    </button>
                )}
            </div>
        </div>
    );
}
