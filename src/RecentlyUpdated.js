import React from 'react';

import { ExpandableImage } from "./ImageList";

import { Session } from './Session';

export class RecentlyUpdated
    extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            meta: this.props.meta,
        }
        this.fetchMetadata = this.fetchMetadata.bind(this);
        this.getRecent = this.getRecent.bind(this);
        this.update = this.update.bind(this);
    }
    componentDidMount() {
        // Session.fetch({
        //     path: '/recentlychanged'
        // })
        // .then(items => {
        //     console.log(items);
        //     this.setState({
        //         items: items
        //     })
        // });
        this.update();
        this.interval = setInterval(this.update, 10000);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    update() {
        this.getRecent();
        this.fetchMetadata();
    }
    getRecent() {
        Session.fetch({
            path: '/recentlychanged'
        })
        .then(({response}) => {
            console.log(response);
            this.setState({
                items: response || []
            })
        });
    }
    fetchMetadata(accordionUid) {
        Session.fetchAllMetaData()
            .then(meta => {
                this.setState({ meta: meta || {} });
            });
    }
    render() {
        return (
            <div className="recently-updated">
                <h5>Recently Updated</h5>
                {
                    this.state.items.map(file => (
                        <ExpandableImage
                            key={file.path}
                            file={file}
                            meta={this.state.meta && this.state.meta[file.path]}
                            onModalClose={this.update}
                        />
                    ))
                }
            </div>
        );
    }
}