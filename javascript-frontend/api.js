//This automatically encodes all special characters EXCEPT
//for =, &, and %. Use api.encode(argument) on an object to encode
//just those characters where needed (typically just on file paths).
function getOrPost(url, payload, getPostEtc) {
    if (url && url.includes('?')) {
        let split = url.split('?');
        let start = split[0];
        let end = '';
        for (let i = 1; i < split.length; i++) {
            if (i === 1) {
                end += split[i];
            }
            else {
                end += '?' + split[i];
            }
        }

        let translation = [
            { left: '=', right: 'ZEZQUALZ' },
            { left: '&', right: 'ZAMPERZZSANSDDK' },
            { left: '%', right: 'ZPERCENTZZZ' },
        ]

        let encoded = end;
        translation.forEach(trans => {
            encoded = encoded.split(trans.left).join(trans.right);
        });
        encoded = encodeURIComponent(encoded);
        translation.forEach(trans => {
            encoded = encoded.split(trans.right).join(trans.left);
        });

        url = start + '?' + encoded;
    }
    return getPostEtc(url, payload).then(function (response) {
        if (response.data === null || response.data === undefined) {
            throw new Error("Implementation Error. Null returned from: " + url);
        }
        if (response.data.tokenNotFound) {
            AuthState.logOut(store);
            throw new Error("Auth token is not valid. Must log back in. url: " + url);
        }
        if (response.data.notAuthorized) {
            throw new Error("User not authorized for: " + url);
        }
        if (response.data.errorOccurred) {
            throw new Error(response.data.errorMsg + " | url: " + url);
        }
        return response.data.data;
    });
}

function encode(argument){
    argument = `${argument}`;
    let translation = [
            { left: '%', right: '%25' },
            { left: '=', right: '%3D' },
            { left: '&', right: '%26' },
        ]

    translation.forEach(trans => {
        argument = argument.split(trans.left).join(trans.right);
    });
    return argument;
}

let hostUrl = 'http://localhost:2703/api/v1/00000000-0000-0000-0000-000000000000/'
function setHostUrlAndToken(serverUrl, authToken){
    hostUrl = new URL(`api/v1/${authToken}`, serverUrl).toString();
    axios.defaults.baseURL = hostUrl;
}

const api = {
    get: function (url, payload) {
        return getOrPost(url, payload, axios.get);
    },
    post: function (url, payload) {
        return getOrPost(url, payload, axios.post);
    },
    put: function (url, payload) {
        return getOrPost(url, payload, axios.put);
    },
    delete: function (url, payload) {
        return getOrPost(url, payload, axios.delete);
    },
    encode,
    setHostUrlAndToken,
};