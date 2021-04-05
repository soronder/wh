import React from 'react';

export class TextArea
    extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value || ''
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
                if(this.props.onSubmit) {
                    this.props.onSubmit(e.target.value);
                }
                this.setState({
                    value: ''
                });
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
            />
        );
    }
}

export default TextArea;