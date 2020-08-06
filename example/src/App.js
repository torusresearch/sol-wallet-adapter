import React from 'react';
import './App.css';
import { Connection, SystemProgram, clusterApiUrl } from '@solana/web3.js';
import Torus from '@toruslabs/torus-embed';

let network = clusterApiUrl('devnet');
class App extends React.Component {
  state = {
    logs: [],
    torus: undefined,
    network: network,
    connection: new Connection(network),
    selectedAddress: '',
  };
  async componentDidMount() {
    const torus = new Torus();
    await torus.init({ buildEnv: 'development', enableLogging: true });
    this.setState({ torus: torus });
  }

  addLog(log) {
    this.setState({ logs: [...this.state.logs, log] });
  }

  sendTransaction = async () => {
    try {
      const connection = this.state.connection;
      let transaction = SystemProgram.transfer({
        fromPubkey: this.state.torus.solana.selectedAddress,
        toPubkey: this.state.torus.solana.selectedAddress,
        lamports: 100,
      });
      this.addLog('Getting recent blockhash');
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      this.addLog('Sending signature request to wallet');
      let signed = await this.state.torus.solana.signTransaction(transaction);
      this.addLog('Got signature, submitting transaction');
      let signature = await connection.sendRawTransaction(signed.serialize());
      this.addLog(
        'Submitted transaction ' + signature + ', awaiting confirmation',
      );
      await connection.confirmTransaction(signature, 1);
      this.addLog('Transaction ' + signature + ' confirmed');
    } catch (e) {
      console.warn(e);
      this.addLog('Error: ' + e.message);
    }
  };

  login = async () => {
    await this.state.torus.login();
    setTimeout(() => {
      console.log(this.state.torus.solana, "solana")
      this.setState({ selectedAddress: this.state.torus.solana.selectedAddress });      
    }, 100);
  };

  render() {
    console.log(this.state.torus);
    return (
      <div className="App">
        <h1>Wallet Adapter Demo</h1>
        <div>Network: {this.state.network}</div>
        {this.state.selectedAddress ? (
          <>
            <div>
              Wallet address: {this.state.torus.solana.selectedAddress}.
            </div>
            <button onClick={this.sendTransaction}>Send Transaction</button>
          </>
        ) : (
          <button onClick={this.login}>Connect to Wallet</button>
        )}
        <hr />
        <div className="logs">
          {this.state.logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>
    );
  }
}

export default App;
