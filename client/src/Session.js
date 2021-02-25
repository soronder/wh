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
    errorExpiry: {},
    toast(state, message) {
        if(Session.token && !Session.name) {
            // not yet authed
            return;
        }
        const now = new Date().getTime();
        if(now < Session.errorExpiry[message]) {
            return;
        }
        Session.errorExpiry[message] = now + 5000;
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
            .then(({response}) => {
                Session.state = response;
                return response;
            });
    },
    fetch({ path, query }) {
        query = query || {};
        query.token = Session.token;
        const search = new URLSearchParams(query);
        return fetch(`${path}?${search}`)
            .then(response => response.text())
            .then(response => JSON.parse(response))
            .then(response => {
                if (response.error) {
                    Session.toast("error", response.error);
                    if(response.errCode === "AUTH_EXP") {
                        Session.name = null;
                    }
                    return { response: null, ...response };
                }
                return { response };
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
            .then(response => {
                if (response.error) {
                    Session.toast("error", response.error);
                    if(response.errCode === "AUTH_EXP") {
                        Session.name = null;
                    }
                    return { response: null, ...response };
                }
                return { response };
            })
    }
}