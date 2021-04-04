import React from "react";

export class TextArea
    extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value || ""
        };
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onChange = this.onChange.bind(this);
    }
    onKeyDown(e) {
        if(this.props.onKeyDown) {
            this.props.onKeyDown(e);
        }
        if(e.keyCode === 13) {
            e.preventDefault();
            if(e.target.value !== this.props.value) {
                this.props.onSubmit(e.target.value);
                e.target.value = null;
            }
        }
    }
    onChange(e) {
        this.setState({
            value: e.target.value
        });
    }
    render() {
        return (
            <textarea
                placeholder={this.props.placeholder}
                value={this.state.value}
                onKeyDown={this.onKeyDown}
                onChange={this.onChange}
                onSubmit={this.props.onSubmit}
            />
        );
    }
}

export default TextArea;