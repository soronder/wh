import React from "react";
import { ToastContainer } from "react-toastify";

import './App.css';

import { Login } from "./Login";
import { ImageList } from "./ImageList";

import 'react-toastify/dist/ReactToastify.min.css';
import "./lib/fontawesome-free-5.15.2-web/css/all.min.css";
import { Session } from "./Session";

export class App
    extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            authed: false,
        };
        this.onAuth = this.onAuth.bind(this);
        this.checkAuth = this.checkAuth.bind(this);
        this.interval = setInterval(this.checkAuth, 10000);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    checkAuth() {
        if(this.state.authed && Session.name === null) {
            this.setState({
                authed: false,
                name: null,
            });
        }
    }
    onAuth(name) {
        this.setState({
            authed: true,
            name: name,
        });
    }
    render() {
        if (!this.state.authed) {
            return (
                <div className="App">
                    <Login onAuth={this.onAuth} />
                </div>
            );
        }
        return (
            <div className="App">
                <ImageList />
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </div>
        );
    }
}

export default App;
