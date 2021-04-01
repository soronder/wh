import React from "react";

import { Session } from "./Session";

export class Login
    extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            password: ""
        };
        this.changeName = this.changeName.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
    componentDidMount() {
        if(Session.token) {
            return Session.fetch({
                    path: "/loginvalidate"
                })
                .then(({ error, name }) => {
                    if(error) {
                        this.setState({
                            error: error,
                        });
                    }
                    else if(name) {
                        Session.setToken(Session.token, name);
                        this.props.onAuth(name);
                    }
                    else {
                        console.log("Unexpected error");
                    }
                });
        }
    }
    changeName(e) {
        this.setState({
            name: e.target.value
        });
    }
    changePassword(e) {
        this.setState({
            password: e.target.value
        });
    }
    onKeyDown(e) {
        if(e.keyCode === 13) {
            e.preventDefault();
            this.onSubmit();
        }
    }
    onSubmit() {
        this.setState({
            error: null,
        });
        return Session.post({
                path: "/login",
                body: {
                    name: this.state.name,
                    password: this.state.password,
                }
            })
            .then(({ token, name, error }) => {
                if(error) {
                    this.setState({
                        error: error,
                    });
                }
                else if(token) {
                    Session.setToken(token, name);
                    this.props.onAuth(name);
                }
                else {
                    console.log("Unexpected error");
                }
            });
    }
    render() {
        return (
            <div className="login">
                <form onSubmit={this.onSubmit}>
                    <input
                        placeholder="Name"
                        onKeyDown={this.onKeyDown}
                        onChange={this.changeName}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        onKeyDown={this.onKeyDown}
                        onChange={this.changePassword}
                    />
                    <input
                        type="submit"
                        value="Submit"
                    />
                    {
                        this.state.error &&
                        <div className="error">{this.state.error}</div>
                    }
                </form>
            </div>
        );
    }
}

export default Login;
