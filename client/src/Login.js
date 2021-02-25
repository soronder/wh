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
        this.onClickSubmit = this.onClickSubmit.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
    componentDidMount() {
        if(Session.token) {
            return Session.fetch({
                    path: "/loginvalidate"
                })
                .then(({ error, response }) => {
                    if(error) {
                        Session.clearToasts();
                        this.setState({ error });
                    }
                    else if(response && response.name) {
                        Session.setToken(Session.token, response.name);
                        this.props.onAuth(response.name);
                    }
                    else {
                        this.setState({
                            error: "Unexpected auth error",
                        });
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
    onClickSubmit(e) {
        e.preventDefault();
        this.onSubmit();
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
            .then(({ response, error }) => {
                if(error) {
                    Session.clearToasts();
                    this.setState({ error });
                }
                else if(response && response.token) {
                    Session.setToken(response.token, response.name);
                    this.props.onAuth(response.name);
                }
                else {
                    this.setState({
                        error: "Unexpected auth error",
                    });
                }
            });
    }
    render() {
        return (
            <div className="login">
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <input
                            className="form-control"
                            placeholder="Name"
                            onKeyDown={this.onKeyDown}
                            onChange={this.changeName}
                        />
                        <input
                            className="form-control"
                            type="password"
                            placeholder="Password"
                            onKeyDown={this.onKeyDown}
                            onChange={this.changePassword}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            onClick={this.onClickSubmit}
                        >
                            Submit
                        </button>
                        {
                            this.state.error &&
                            <div className="alert alert-danger">{this.state.error}</div>
                        }
                    </div>
                </form>
            </div>
        );
    }
}

export default Login;
