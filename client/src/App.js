import React from "react";

import './App.css';

import { Login } from "./Login";
import { ImageList } from "./ImageList";

import "./lib/fontawesome-free-5.15.2-web/css/all.min.css";

export class App
    extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            authed: false,
        };
        this.onAuth = this.onAuth.bind(this);
    }
    onAuth(name) {
        this.setState({
            authed: true,
            name: name,
        });
    }
    render() {
        return (
            <div className="App">
                {
                    this.state.authed ? <ImageList /> : <Login onAuth={this.onAuth} />
                }
            </div>
        );
    }
}

export default App;
