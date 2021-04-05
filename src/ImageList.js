import React from 'react';
import moment from 'moment';

import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';

import {
    ToggleButton,
    ToggleButtonGroup,
} from 'react-bootstrap';

import 'react-accessible-accordion/dist/fancy-example.css';

import { RecentlyUpdated } from "./RecentlyUpdated";
import { Session } from './Session';
import { TextArea } from './TextArea';
import { size } from './utils';

import './ImageList.css';

class CommentList
    extends React.Component {
    ref = React.createRef();
    componentDidUpdate() {
        if(this.ref.current) {
            this.ref.current.scrollTop = this.ref.current.scrollHeight;
        }
    }
    render() {
        const comments = this.props.comments;
        if(!comments || !comments.length) {
            return "No comments yet";
        }
        return (
            <div ref={this.ref} className='comment-list'>
            {
                comments.map(comment => (
                    <div key={`${comment.time}${comment.author}`} className="chat">
                        <div className="tooltip bs-tooltip-bottom" role="tooltip">
                            <div className="arrow"></div>
                            <div className="tooltip-inner">
                                {moment(comment.time).format('MMM Do YYYY h:mma')}
                            </div>
                        </div>
                        <span className='author'>
                            {comment.author}
                        </span>: {comment.comment}
                    </div>
                ))
            }
            </div>
        );
    }
}

class Modal
    extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            meta: {},
            editingDescription: false,
        };
        this.updateMeta = this.updateMeta.bind(this);
        this.submitComment = this.submitComment.bind(this);
        this.onKeyDownDescription = this.onKeyDownDescription.bind(this);
        this.editDescription = this.editDescription.bind(this);
        this.submitDescription = this.submitDescription.bind(this);
        this.claim = this.setClaimed.bind(this, true);
        this.unclaim = this.setClaimed.bind(this, false);
        this.discard = this.setDiscard.bind(this, true);
        this.undiscard = this.setDiscard.bind(this, false);
        this.sold = this.setSold.bind(this, true);
        this.unsold = this.setSold.bind(this, false);
        this.storage = this.setStorage.bind(this, true);
        this.unstorage = this.setStorage.bind(this, false);
        this.startCountdown = this.startCountdown.bind(this);
        this.stopCountdown = this.stopCountdown.bind(this);
    }
    editDescription() {
        this.setState({ editingDescription: true });
    }
    onKeyDownDescription(e) {
        if(e.keyCode === 27) {
            e.stopPropagation();
            this.setState({ editingDescription: false });
        }
    }
    submitDescription(value) {
        Session.post({
            path: '/meta',
            query: { path: this.props.file.path },
            body: { description: value },
        })
        .then(({response}) => {
            if(!response) {
                return;
            }
            this.setState({
                meta: response || {},
                editingDescription: false,
            });
        });
    }
    componentDidMount() {
        Session.fetch({
            path: '/meta',
            query: { path: this.props.file.path },
        })
        .then(this.updateMeta);

        Session.fetch({
            path: '/recentlychanged'
        })
        .then(({response}) => {
            console.log(response);
        });
    }
    submitComment(value) {
        Session.post({
            path: '/meta',
            query: { path: this.props.file.path },
            body: { comment: value }
        })
        .then(this.updateMeta);
    }
    setClaimed(claimed) {
        Session.post({
            path: '/meta',
            query: { path: this.props.file.path },
            body: { claimed },
        })
        .then(this.updateMeta);
    }
    setDiscard(discard) {
        Session.post({
            path: '/meta',
            query: { path: this.props.file.path },
            body: { discard },
        })
        .then(this.updateMeta);
    }
    setSold(sold) {
        Session.post({
            path: '/meta',
            query: { path: this.props.file.path },
            body: { sold },
        })
        .then(this.updateMeta);
    }
    setStorage(storage) {
        Session.post({
            path: '/meta',
            query: { path: this.props.file.path },
            body: { storage },
        })
        .then(this.updateMeta);
    }
    updateMeta({response}) {
        this.setState({ meta: response || {} });
    }
    startCountdown() {
        this.setCountdown(moment().add(5, 'days').valueOf());
    }
    stopCountdown() {
        this.setCountdown(0);
    }
    setCountdown(countdown) {
        Session.post({
            path: '/meta',
            query: { path: this.props.file.path },
            body: { countdown },
        })
        .then(this.updateMeta);
    }
    render() {
        const {file} = this.props;
        let description, comments, claimed, discard, sold, storage, countdown;
        if(this.state.meta) {
            ({description, comments, claimed, discard, sold, storage, countdown} = this.state.meta);
        }
        return (
            <div className='overlay'>
                <div className='overlay-body'>
                    <h2 className='overlay-header'>
                        {file.name}
                        <i onClick={this.props.closeModal} className='fas fa-times'></i>
                    </h2>
                    <div className='overlay-content'>
                        <div className='row'>
                            <div key="img" className='col-md-8'>
                                <img src={`${file.path}`} />
                            </div>
                            <div key="info" className='col-md-4'>
                                <div className='description'>
                                    {
                                        this.state.editingDescription ? (
                                            <TextArea
                                                placeholder='Add Description...'
                                                value={description}
                                                onSubmit={this.submitDescription}
                                                onKeyDown={this.onKeyDownDescription}
                                            />
                                        ) : (
                                            <div>
                                                <pre>
                                                    {description || "No description yet"}
                                                </pre>
                                                <i className='far fa-edit' onClick={this.editDescription}></i>
                                            </div>
                                        )
                                    }
                                </div>
                                {
                                    claimed && claimed.length > 0 &&
                                    <div className='claimed'>
                                        {claimed.join(', ')}
                                        {claimed.length === 1 ? ' is ' : ' are '}
                                        interested.
                                    </div>
                                }
                                <div className='comment-box'>
                                    <CommentList comments={comments} />
                                    <div>
                                        <TextArea
                                            placeholder='Add Comment...'
                                            onSubmit={this.submitComment}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='overlay-footer'>
                        {
                        storage ?
                        <div className="unstorage btn btn-danger" onClick={this.unstorage}>Move out of Storage</div> :
                        <div className="storage btn btn-info" onClick={this.storage}>Move to Storage</div>
                        }
                        {
                        discard ?
                        <div className="undiscard btn btn-success" onClick={this.undiscard}>Cancel Discard</div> :
                        <div className="discard btn btn-danger" onClick={this.discard}>Discard</div>
                        }
                        {
                        sold ?
                        <div className="unsold btn btn-danger" onClick={this.unsold}>Cancel Sold</div> :
                        <div className="sold btn btn-info" onClick={this.sold}>Sold</div>
                        }
                        {
                        countdown ?
                        <div className="uncountdown btn btn-danger" onClick={this.stopCountdown}>Cancel Countdown</div> :
                        <div className="countdown btn btn-warning" onClick={this.startCountdown}>Start Countdown</div>
                        }
                        {
                        claimed && claimed.includes(Session.name) ?
                        <div className="unclaim btn btn-danger" onClick={this.unclaim}>Not Interested</div> :
                        <div className="claim btn btn-primary" onClick={this.claim}>Interested</div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export class ExpandableImage
    extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
        this.closeModal = this.setOpen.bind(this, false);
        this.openModal = this.setOpen.bind(this, true);
        this.closeOnEscape = this.closeOnEscape.bind(this);
    }
    closeOnEscape(e) {
        if(e.keyCode === 27) {
            e.preventDefault();
            this.closeModal();
        }
    }
    setOpen(open) {
        this.setState({open});
        if(open) {
            document.onkeydown = this.closeOnEscape;
        }
        else {
            document.onkeydown = null;
            if(this.props.onModalClose) {
                this.props.onModalClose();
            }
        }
    }
    componentDidUpdate() {
        document.body.className = document.body.className.replace('overlay-open', '');
        if(this.state.open) {
            document.body.className += ' overlay-open';
        }
    }
    render() {
        const {file, meta} = this.props;
        let comments, claimed, storage, discard, sold, countdown;
        if(meta) {
            ({ comments, claimed, storage, discard, sold, countdown } = meta);
        }
        let claimedByYou;
        let claimedByMultiple;
        let claimedByOthers;
        if(claimed && claimed.length > 0) {
            claimedByYou = claimed.includes(Session.name);
            claimedByMultiple = claimed.length > 1;
            claimedByOthers = !claimedByYou;
        }
        return [
            <div
                key='img'
                className='img'
                style={{backgroundImage: `url('${file.path}')`}}
                onClick={this.openModal}
            >
                {
                    comments && comments.length > 0 && 
                    <i className={`far fa-${comments.length > 1 ? 'comments' : 'comment'}`}></i>
                }
                <div className="title">{file.name}</div>
                <div className='status-bar'>
                    {
                        (claimedByYou || claimedByOthers) &&
                        <div className={`claimed btn btn-${claimedByYou ? 'primary' : 'info'}`}>
                            Claimed by
                            {claimedByYou && " You "}
                            {(claimedByYou && claimedByMultiple) && " And "}
                            {claimedByMultiple ? " Others" : claimedByOthers ? ` ${claimed}` : ''}
                        </div>
                    }
                    {
                        storage &&
                        <div className='storage btn btn-warning'>
                            Storage
                        </div>
                    }
                    {
                        discard &&
                        <div className='discard btn btn-danger'>
                            Discard
                        </div>
                    }
                    {
                        sold &&
                        <div className='sold btn btn-info'>
                            Sold
                        </div>
                    }
                    {
                        countdown &&
                        <div className='countdown btn btn-warning'>
                            {moment(countdown).from(new Date().getTime(), true)} left
                        </div>
                    }
                </div>
            </div>,
            this.state.open &&
            <Modal
                key='overlay'
                file={file}
                closeModal={this.closeModal}
            />
        ];
    }
}

class Directory
    extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            meta: {},
            open: false,
        };
        this.onOpen = this.onOpen.bind(this);
        this.fetchMetadata = this.fetchMetadata.bind(this);
    }
    fetchMetadata(accordionUid) {
        Session.fetchAllMetaData()
            .then(meta => {
                this.setState({ meta: meta || {} });
            });
    }
    onOpen(accordionUid) {
        Session.fetchAllMetaData()
            .then(meta => {
                this.setState({
                    meta: meta || {},
                    open: !this.state.open,
                });
            });
    }
    includeItem(meta) {
        if( meta ) {
            const includeStorage = this.props.toggles.storage;
            const includeDiscard = this.props.toggles.discard;
            const includeSold = this.props.toggles.sold;
            const includeClaimed = this.props.toggles.claimed;
            const includeCountdown = this.props.toggles.countdown;
            const includeCommented = this.props.toggles.commented;
            if( includeStorage && meta.storage ) {
                return true;
            }
            if( includeDiscard && meta.discard ) {
                return true;
            }
            if( includeSold && meta.sold ) {
                return true;
            }
            if( includeCountdown && meta.countdown ) {
                return true;
            }
            if( includeClaimed && meta.claimed && meta.claimed.length ) {
                return true;
            }
            if( includeCommented && meta.comments && meta.comments.length ) {
                return true;
            }
            if( this.props.toggles.available ) {
                return ! meta.storage &&
                       ! meta.discard &&
                       ! meta.sold &&
                       ! meta.countdown &&
                       ( ! meta.claimed || ! meta.claimed.length ) &&
                       ( ! meta.commented || ! meta.commented.length );
            }
        }
        else if( this.props.toggles.available ) {
            return true;
        }
        return false;
    }
    render() {
        const {dir} = this.props;
        const totalDirSize = dir.children.reduce((r, file) => r + file.size, 0);
        return (
            <Accordion allowZeroExpanded={true} onChange={this.onOpen}>
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            {dir.name}
                            <span>
                                {dir.children.length} items - {size(totalDirSize)}
                            </span>
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        {dir.children.map((file, index) => {
                            if (file.type === 'directory') {
                                return <Directory key={file.path} dir={file} toggles={this.props.toggles} />;
                            }
                            else if (file.type === 'file') {
                                const meta = this.state.meta[file.path];
                                const include = this.includeItem( meta );
                                return this.state.open &&
                                       include &&
                                       (
                                           <ExpandableImage
                                               key={file.path}
                                               file={file}
                                               meta={meta}
                                               onModalClose={this.fetchMetadata}
                                           />
                                       );
                            }
                            return null;
                        })}
                    </AccordionItemPanel>
                </AccordionItem>
            </Accordion>
        );
    }
}

export class ImageList 
    extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dir: null,
            toggleArray: ["available", "claimed", "countdown"],
            toggles: { available: true, claimed: true, countdown: true },
        };
        this.toggleType = this.toggleType.bind(this);
    }
    componentDidMount() {
        Session.fetch({
            path: '/dir',
        })
        .then(({response}) => {
            this.setState({
                dir: response || []
            });
        });

        Session.fetch({
            path: '/meta',
        })
        .then(({response}) => {
            this.setState({ meta: response || {} });
        });
    }
    toggleType(toggles) {
        this.setState({
            toggleArray: toggles,
            toggles: toggles.reduce((r, name) => {
                r[name] = true;
                return r;
            }, {})
        });
    }
    render() {
        if (!this.state.dir) {
            return null;
        }
        return (
            <div className='row image-list'>
                <div className='col-10 directories'>
                    {this.state.dir.children.map(dir => (
                        <Directory key={dir.path} dir={dir} toggles={this.state.toggles} />
                    ))}
                </div>
                <div className='col-2'>
                    <ToggleButtonGroup
                        type="checkbox"
                        vertical
                        value={this.state.toggleArray}
                        onChange={this.toggleType}
                    >
                        <ToggleButton value="available">Available</ToggleButton>
                        <ToggleButton value="claimed">Claimed</ToggleButton>
                        <ToggleButton value="storage">Storage</ToggleButton>
                        <ToggleButton value="discard">Discard</ToggleButton>
                        <ToggleButton value="sold">Sold</ToggleButton>
                        <ToggleButton value="countdown">Countdown</ToggleButton>
                        <ToggleButton value="commented">Commented</ToggleButton>
                    </ToggleButtonGroup>
                    <RecentlyUpdated meta={this.state.meta} />
                </div>
            </div>
        );
    }
}

export default ImageList;
