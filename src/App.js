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
    const contractAddress = "0x132Aa303B0990773376540CEb1F105F3F75F10a5";
    /**
     * Create a variable here that references the abi content!
     */
    const contractABI = abi.abi;
    const [msg, setMsg] = useState("");
    const [totalWaves, setTotalWaves] = useState(0);
    const [allWaves, setAllWaves] = useState([]);

    const checkIfWalletIsConnected = async function () {
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
    const connectWallet = async function () {
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

    const BaseConnection = function (cb) {
        return function () {
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

                    cb(wavePortalContract);
                } else {
                    console.log("Ethereum object doesn't exist!");
                }
            } catch (error) {
                console.log(error);
            }
        };
    };

    const wave = BaseConnection(async function (wavePortalContract) {
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.wave(msg);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
    });

    const addFriend = BaseConnection(async function (wavePortalContract) {
        const addFriendTxn = await wavePortalContract.addFriend();
        console.log("adding friend");
        console.log("Mining...", addFriendTxn.hash);
        await addFriendTxn.wait();
        console.log("Mined -- ", addFriendTxn.hash);
        console.log("added friend");
    });

    const removeFriend = BaseConnection(async function (wavePortalContract) {
        const removeFriendTxn = await wavePortalContract.addFriend();
        console.log("adding friend");
        console.log("Mining...", removeFriendTxn.hash);
        await removeFriendTxn.wait();
        console.log("Mined -- ", removeFriendTxn.hash);
        console.log("added friend");
    });

    const getAllWaves = BaseConnection(async function (wavePortalContract) {
        let allWaves = await wavePortalContract.getAllWaves();
        console.log(allWaves);

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        const wavesCleaned = allWaves.map((wave) => {
            return {
                address: wave.waver,
                timestamp: new Date(wave.timestamp * 1000),
                message: wave.message,
            };
        });
        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
    });

    /*
     * This runs our function when the page loads.
     */
    useEffect(() => {
        checkIfWalletIsConnected();
        const totalWavesInterval = setInterval(
            BaseConnection(async function (wavePortalContract) {
                let count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());
                setTotalWaves(count.toNumber());
                getAllWaves();
            }),
            2000
        );
        return () => {
            clearInterval(totalWavesInterval);
        };
    }, []);

    return (
        <div className="mainContainer">
            <div className="dataContainer">
                <div className="header">👋 Hey there!</div>

                <div className="bio">
                    I am Gajraj and I am a programmer so that's pretty cool
                    right? Connect your Ethereum wallet and wave at me! You need
                    to add me as friend to wave :)
                </div>

                <div className="bio">
                    {totalWaves} waves have been waved at me so far!
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <textarea
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        placeholder={"Add your message!"}
                        style={{
                            height: "100px",
                        }}
                    />
                    <button
                        className="waveButton"
                        disabled={currentAccount === ""}
                        onClick={wave}
                    >
                        Wave at Me
                    </button>
                </div>

                <button
                    className="waveButton"
                    disabled={currentAccount === ""}
                    onClick={addFriend}
                >
                    Add me as your Friend!
                </button>

                <button
                    className="waveButton"
                    disabled={currentAccount === ""}
                    onClick={removeFriend}
                >
                    Remove me as your Friend :(
                </button>

                {/*
                 * If there is no currentAccount render this button
                 */}
                {!currentAccount && (
                    <button className="waveButton" onClick={connectWallet}>
                        Connect Wallet
                    </button>
                )}

                {allWaves.map((wave, index) => {
                    return (
                        <div
                            key={index}
                            style={{
                                backgroundColor: "OldLace",
                                margin: "16px 0px",
                                padding: "8px",
                            }}
                        >
                            <div>Address: {wave.address}</div>
                            <div>Time: {wave.timestamp.toString()}</div>
                            <div>Message: {wave.message}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
