import { toast } from "react-toastify";

export const Session = {
    state: {},
    token: localStorage.getItem('token'),
    name: null,
    setToken(token, name) {
        localStorage.setItem('token', token);
        Session.token = token;
        Session.name = name;
    },
    clearToasts() {
        toast.dismiss()
    },
    toast(state, message) {
        if(Session.token && !Session.name) {
            // not yet authed
            return;
        }
        toast[state](message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    },
    fetchAllMetaData() {
        return Session.fetch({
                path: '/meta',
            })
            .then(meta => {
                Session.state = meta;
                return meta;
            });
    },
    fetch({ path, query }) {
        query = query || {};
        query.token = Session.token;
        const search = new URLSearchParams(query);
        return fetch(`${path}?${search}`)
            .then(response => response.text())
            .then(response => JSON.parse(response))
            .then(json => {
                if (json.error) {
                    Session.toast("error", json.error);
                }
                return json;
            })
    },
    post({ path, query, headers, body }) {
        query = query || {};
        query.token = Session.token;
        const search = new URLSearchParams(query);
        return fetch(`${path}?${search}`, {
                method: 'POST',
                headers: headers || {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
            .then(response => response.text())
            .then(response => JSON.parse(response))
            .then(json => {
                if (json.error) {
                    Session.toast("error", json.error);
                }
                return json;
            })
    }
}