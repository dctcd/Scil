import axios from "axios";
import {ProjectContext, TabContext, } from "../App";



process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const instance = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 100000,
    rejectUnauthorized: false,
});

export const updateGitlab = async (token, setName, setUsername, setImage, setGitlabError, setGitlabAuthenticated) => {
    try {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        await instance.post('/updateGitlab', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            'token': token
        })
            .then(response => {
                // response.data = code;
                if (response.status === 200) {
                    setName(response.data.name);
                    setUsername(response.data.username);
                    let image = response.data.avatar_url;
                    if (image) {
                        setImage(image);
                    }
                    setGitlabError("Updated GitLab private token");
                    setGitlabAuthenticated(true);
                }
                else {
                    setGitlabError("Invalid GitLab private token");
                }
            })
            .catch(e => {
                if (e.status === 401) {
                    setGitlabError("Invalid GitLab private token");
                }
                else {
                    setGitlabError("Could not verify GitLab private token");
                }
            });
    } catch (e) {
        setGitlabError("Could not verify GitLab private token");
    }
}

export const getRepositories = async (setRepositories, setGitlabError) => {
    try {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        await instance.get('/getRepositories')
            .then(response => {
                // response.data = code;
                if (response.status === 200) {
                    setRepositories(response.data);
                }
                else {
                    setGitlabError("Error fetching repositories");
                }
            })
            .catch(e => {
                setGitlabError("Error fetching repositories");
            });
    } catch (e) {
        setGitlabError("Error fetching repositories");
    }
}

export const updateOpenai = async (key, setOpenaiError, setOpenaiKeySetup) => {
    try {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        await instance.post('/updateOpenai', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            'key': key
        })
            .then(response => {
                // response.data = code;
                if (response.status === 200) {
                    setOpenaiKeySetup(true);
                    setOpenaiError("Updated OpenAI API key");
                }
                else {
                    setOpenaiError("Invalid OpenAI API key");
                }
            })
            .catch(e => {
                if (e.status === 400) {
                    setOpenaiError("Invalid OpenAI API key");
                }
                else {
                    setOpenaiError("Could not verify OpenAI API key");
                }
            });
    } catch (e) {
        setOpenaiError("Could not verify OpenAI API key");
    }
}

export const getAnalysis = async (code, setProject, setAddCodeVisibility, setTab, availableProjects, setAvailableProjects, setLoadingVisible) => {
    try {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        await instance.post('/analyse', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            code: code
        })
            .then(response => {
                // response.data = code;
                response.data.code = code;
                setProject(response.data);
                setTab("Code");
                setAddCodeVisibility(false);
                if (!availableProjects.includes(response.data.codeTitle)) {
                    var addTitle = [{"name" : response.data.codeTitle, "project" : response.data}];
                    setAvailableProjects(addTitle.concat(availableProjects));
                }
                setLoadingVisible(false);
                return response.data;
            })
            .catch(e => {
                setLoadingVisible(false);
            });
    } catch (e) {
        setLoadingVisible(false);
    }
}

export const getRemoteCodebaseAnalysis = async (url, projectNumber, title, setProject, setAddCodeVisibility, setTab, availableProjects, setAvailableProjects, setLoadingVisible) => {
    try {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        await instance.post('/analyseRemoteRepository', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            url: url,
            title: title,
            number: projectNumber
        })
            .then(response => {
                // response.data = code;
                setProject(response.data);
                setTab("Code");
                setAddCodeVisibility(false);
                // var index = 1;
                // if (availableProjects.includes(title)) {
                //     while (true) {
                //         if (availableProjects.includes(title + " " + index)) {
                //             index++;
                //         }
                //         else {
                //             setAvailableProjects([title + " " + index].concat(availableProjects));
                //             break;
                //         }
                //     }
                // }
                // else {

                function isNotMatch (projectMatch) {
                    if (projectMatch.hasOwnProperty("number")) {
                        if (projectMatch.number === projectNumber) {
                            return false;
                        }
                    }
                    return true;
                }

                availableProjects = availableProjects.filter(isNotMatch);
                // else {
                    setAvailableProjects([{"name" : title, "number": projectNumber}].concat(availableProjects));
                // }
                setLoadingVisible(false);
                return response.data;
            })
            .catch(e => {
                setLoadingVisible(false);
            });
    } catch (e) {
        setLoadingVisible(false);
    }
}

export const getAuthenticationStatus = async (setGitlabAuthenticated, setOpenaiKeySetup, setName, setUsername, setImage) => {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    await instance.get('/getAuthenticationStatus')
        .then(response => {
            if (response.status === 200) {
                setGitlabAuthenticated(response.data.gitlabAuthenticated);
                setOpenaiKeySetup(response.data.openaiAuthenticated);
                setName(response.data.name);
                setUsername(response.data.username);
                let image = response.data.avatar_url;
                if (image) {
                    setImage(image);
                }
            }
        });
}

export const getCachedRepositories = async (setAvailableProjects, setProject, setTab) => {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    await instance.get('/getCachedRepositories')
        .then(response => {
            if (response.status === 200) {

                setAvailableProjects(response.data);
                alert(JSON.stringify(response.data))
                if (response.data) {
                    if (response.data.length > 0) {
                        getRemoteCodebaseAnalysis("", response.data[0].number, response.data[0].name, setProject,
                            () => {}, setTab, [], () => {},
                            () => {})
                    }
                }
                } //hi
        });
}