import React from "react";
import moment from "moment";

import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';

import 'react-accessible-accordion/dist/fancy-example.css';

import { Session } from "./Session";
import { TextArea } from "./TextArea";
import { size } from "./utils";

import './ImageList.css';

class CommentList
    extends React.Component {
    render() {
        return (
            <div className="comment-list">
            {
                this.props.comments.map(comment => (
                    <div key={`${comment.time}${comment.author}`}>
                        <span className="time">
                            {moment(comment.time).format("MMM Do YYYY h:mm:ssa")}
                        </span>
                        <span className="author">{comment.author}</span>: {comment.comment}
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
        // this.onKeyDownComment = this.onKeyDownComment.bind(this);
        this.editDescription = this.editDescription.bind(this);
        this.submitDescription = this.submitDescription.bind(this);
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
    // onKeyDownComment(e) {
    //     if(e.keyCode === 13) {
    //         e.preventDefault();
    //         this.submitComment(e.target.value);
    //         e.target.value = null;
    //     }
    // }
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
    render() {
        const {file, dir, index} = this.props;
        let description, comments;
        if(this.state.meta) {
            ({description, comments} = this.state.meta);
        }
        return (
            <div className="modal">
                <div className="modal-body">
                    <h2 className="modal-header">
                        {file.name}
                        <span onClick={this.props.closeModal} className="modal-close">X</span>
                    </h2>
                    <div className="modal-content">
                        <div className="column">
                            <img src={`${file.path}`} />
                        </div>
                        <div className="column">
                            <div className="description">
                                {
                                    this.state.editingDescription ? (
                                        <TextArea
                                            placeholder="Add Description..."
                                            value={description}
                                            onSubmit={this.submitDescription}
                                            onKeyDown={this.onKeyDownDescription}
                                        />
                                    ) : (
                                        <div>
                                            {description}
                                            <i className="far fa-edit" onClick={this.editDescription}></i>
                                        </div>
                                    )
                                }
                            </div>
                            <div className="comment-box">
                                {comments ? <CommentList comments={comments} /> : "No comments"}
                                <div>
                                    <TextArea
                                        placeholder="Add Comment..."
                                        onSubmit={this.submitComment}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
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
        document.body.className = document.body.className.replace("modal-open", "");
        if(this.state.open) {
            document.body.className += " modal-open";
        }
    }
    render() {
        const {file, dir, index} = this.props;
        let comments, claimed;
        if(this.props.meta) {
            ({ comments, claimed } = this.props.meta);
        }
        return [
            <div
                key="img"
                className="img"
                style={{backgroundImage: `url("${file.path}")`}}
                onClick={this.openModal}
            >
                {
                    comments && comments.length > 0 && 
                    <i className={`far fa-${comments.length > 1 ? "comments" : "comment"}`}></i>
                }
                {
                    claimed && 
                    <i className={`fas fa-heart`}></i>
                }
                <div>{file.name}</div>
            </div>,
            this.state.open && <Modal key="modal" dir={dir} file={file} index={index} closeModal={this.closeModal} />
        ];
    }
}

class Directory
    extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            meta: {}
        };
        this.onOpen = this.onOpen.bind(this);
    }
    onOpen(accordionUid) {
        Session.fetchAllMetaData()
            .then(meta => {
                this.setState({ meta });
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
                            if (file.type === "directory") {
                                return <Directory key={file.path} dir={file} />;
                            }
                            else if (file.type === "file") {
                                return (
                                    <GalleryModal
                                        key={file.path}
                                        file={file}
                                        dir={dir}
                                        index={index}
                                        meta={this.state.meta[file.path]}
                                        onModalClose={this.onOpen}
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
            <div className="image-list">
                <Directory dir={this.state.dir} />
            </div>
        );
    }
}

export default ImageList;
