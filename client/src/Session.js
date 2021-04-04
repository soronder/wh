export const Session = {
    state: {},
    token: localStorage.getItem('token'),
    setToken(token, name) {
        localStorage.setItem('token', token);
        Session.token = token;
        Session.name = name;
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
            .then(response => JSON.parse(response));
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
            .then(response => JSON.parse(response));
    }
}