import React from 'react';
import moment from 'moment';

import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';

import 'react-accessible-accordion/dist/fancy-example.css';

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
        this.submitComment = this.submitComment.bind(this);
        this.onKeyDownDescription = this.onKeyDownDescription.bind(this);
        this.editDescription = this.editDescription.bind(this);
        this.submitDescription = this.submitDescription.bind(this);
        this.claim = this.setClaimed.bind(this, true);
        this.unclaim = this.setClaimed.bind(this, false);
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
        .then(meta => {
            this.setState({
                meta: meta,
                editingDescription: false,
            });
        });
    }
    componentDidMount() {
        Session.fetch({
            path: '/meta',
            query: { path: this.props.file.path },
        })
        .then(meta => {
            this.setState({ meta });
        });
    }
    submitComment(value) {
        Session.post({
            path: '/meta',
            query: { path: this.props.file.path },
            body: { comment: value }
        })
        .then(meta => {
            this.setState({ meta });
        });
    }
    setClaimed(claimed) {
        Session.post({
            path: '/meta',
            query: { path: this.props.file.path },
            body: { claimed: claimed },
        })
        .then(meta => {
            this.setState({ meta });
        });
    }
    render() {
        const {file, dir, index} = this.props;
        let description, comments, claimed;
        if(this.state.meta) {
            ({description, comments, claimed} = this.state.meta);
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
                                                {description || "No description yet"}
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

class GalleryModal
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
        const {file, dir, index} = this.props;
        let comments, claimed;
        if(this.props.meta) {
            ({ comments, claimed } = this.props.meta);
        }
        let claimedByYou;
        let claimedByOthers;
        if(claimed && claimed.length > 0) {
            claimedByYou = claimed.includes(Session.name);
            claimedByOthers = claimed.length > 1 || !claimedByYou;
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
                {
                    (claimedByYou || claimedByOthers) &&
                    <div className="claimed btn btn-primary">
                        Claimed by
                        {claimedByYou && " You "}
                        {(claimedByYou && claimedByOthers) && " And "}
                        {claimedByOthers && " Others "}
                    </div>
                }
            </div>,
            this.state.open &&
            <Modal
                key='overlay'
                dir={dir}
                file={file}
                index={index}
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
                this.setState({ meta });
            });
    }
    onOpen(accordionUid) {
        Session.fetchAllMetaData()
            .then(meta => {
                this.setState({ meta, open: !this.state.open });
            });
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
                                return <Directory key={file.path} dir={file} />;
                            }
                            else if (file.type === 'file') {
                                return this.state.open && (
                                    <GalleryModal
                                        key={file.path}
                                        file={file}
                                        dir={dir}
                                        index={index}
                                        meta2={Session.state[file.path]}
                                        meta={this.state.meta[file.path]}
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
        this.state = { dir: null };
    }
    componentDidMount() {
        Session.fetch({
            path: '/dir',
        })
        .then(directories => {
            this.setState({
                dir: directories
            });
        });

        Session.fetch({
            path: '/meta',
        })
        .then(meta => {
            this.setState({ meta });
        });
    }
    render() {
        if (!this.state.dir) {
            return null;
        }
        return (
            <div className='image-list'>
                {this.state.dir.children.map(dir => (
                    <Directory key={dir.path} dir={dir} />
                ))}
            </div>
        );
    }
}

export default ImageList;
