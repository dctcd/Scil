import axios from "axios";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const instance = axios.create({
    baseURL: 'https://localhost:5002',
    timeout: 0,
    rejectUnauthorized: false,
});

export const updateGitlab = async (token, setName, setUsername, setImage, setGitlabError, setGitlabAuthenticated) => {
    try {
        await instance.post('/updateGitlab', {
            headers: {
                'Access-Control-Allow-Origin': 'https://localhost:5001',
                'Content-Type': 'application/json',
            },
            'token': token
        })
            .then(response => {
                if (response.status === 200) {
                    setName(response.data.name);
                    setUsername(response.data.username);
                    let image = response.data.avatar_url;
                    if (image) {
                        setImage(image);
                    }
                    setGitlabError("Updated GitLab private token, please restart backend");
                    setGitlabAuthenticated(true);
                }
                else {
                    setGitlabError("Invalid GitLab private token, please restart backend");
                }
            })
            .catch(e => {
                if (e.status === 401) {
                    setGitlabError("Invalid GitLab private token");
                }
                else {
                    setGitlabError("Could not verify GitLab private token");
                }
                console.error(e);
            });
    } catch (e) {
        console.error(e);
        setGitlabError("Could not verify GitLab private token");
    }
}

export const getRepositories = async (setRepositories, setGitlabError) => {
    try {
        await instance.get('/getRepositories', {
            headers: {
                'Access-Control-Allow-Origin': 'https://localhost:5001'
            }})
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
                console.error(e);
                setGitlabError("Error fetching repositories");
            });
    } catch (e) {
        console.error(e);
        setGitlabError("Error fetching repositories");
    }
}

export const updateOpenai = async (key, setOpenaiError, setOpenaiKeySetup) => {
    try {
        await instance.post('/updateOpenai', {
            headers: {
                'Access-Control-Allow-Origin': 'https://localhost:5001',
                'Content-Type': 'application/json',
            },
            'key': key
        })
            .then(response => {
                // response.data = code;
                if (response.status === 200) {
                    setOpenaiKeySetup(true);
                    setOpenaiError("Updated OpenAI API key, please restart backend");
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
                console.error(e);
            });
    } catch (e) {
        console.error(e);
        setOpenaiError("Could not verify OpenAI API key");
    }
}

export const getAnalysis = async (code, setProject, setAddCodeVisibility, setTab, availableProjects, setAvailableProjects, setLoadingVisible) => {
    try {
        await instance.post('/analyse', {
            headers: {
                'Access-Control-Allow-Origin': 'https://localhost:5001',
                'Content-Type': 'application/json',
            },
            code: code
        })
            .then(response => {
                // response.data = code;
                response.data[0]["uploadedCode"].code = code;
                response.data[0]["uploadedCode"].source = "Uploaded via Web UI";
                setProject(response.data);
                setTab("Code");
                setAddCodeVisibility(false);
                if (!availableProjects.includes(response.data.codeTitle)) {
                    var addTitle = [{"name" : response.data[0]["uploadedCode"].codeTitle, "project" : response.data}];
                    setAvailableProjects(addTitle.concat(availableProjects));
                }
                setLoadingVisible(false);
                return response.data;
            })
            .catch(e => {
                console.error(e);
                setLoadingVisible(false);
            });
    } catch (e) {
        console.error(e);
        setLoadingVisible(false);
    }
}

export const analyseUpdatedBranch = async (projectNumber, setProject, setLoadingVisible, setLoadingProblem) => {
    try {
        await instance.post('/analyseUpdatedBranch', {
            headers: {
                'Access-Control-Allow-Origin': 'https://localhost:5001',
                'Content-Type': 'application/json',
            },
            number: projectNumber
        })
            .then(response => {
                setProject(response.data);
                setLoadingVisible(false);
                setLoadingProblem(false);
                return response.data;
            })
            .catch(e => {
                setLoadingVisible(false);
                setLoadingProblem(true);
                e.response.data.hasOwnProperty("error") ? alert(e.response.data.error) : console.error(e);
            });
    } catch (e) {
        console.error(e);
        setLoadingVisible(false);
        setLoadingProblem(true);
    }
}

export const getRemoteCodebaseAnalysis = async (url, projectNumber, title, setProject, setAddCodeVisibility, setTab, availableProjects, setAvailableProjects, setLoadingVisible) => {
    try {
        await instance.post('/analyseRemoteRepository', {
            headers: {
                'Access-Control-Allow-Origin': 'https://localhost:5001',
                'Content-Type': 'application/json',
            },
            url: url,
            title: title,
            number: projectNumber
        })
            .then(response => {
                setProject(response.data);
                setTab("Code");
                setAddCodeVisibility(false);
                function isNotMatch (projectMatch) {
                    if (projectMatch.hasOwnProperty("number")) {
                        if (projectMatch.number === projectNumber) {
                            return false;
                        }
                    }
                    return true;
                }
                availableProjects = availableProjects.filter(isNotMatch);
                setAvailableProjects([{"name" : title, "number": projectNumber}].concat(availableProjects));
                setLoadingVisible(false);
                return response.data;
            })
            .catch(e => {
                console.error(e);
                setLoadingVisible(false);
            });
    } catch (e) {
        console.error(e);
        setLoadingVisible(false);
    }
}

export const getAuthenticationStatus = async (setGitlabAuthenticated, setOpenaiKeySetup, setName, setUsername, setImage, setLoginLoading) => {
    try {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        await instance.get('/getAuthenticationStatus', {
            headers: {
                'Access-Control-Allow-Origin': 'https://localhost:5001'
            }
        })
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
                    setLoginLoading(false);
                }
            })
            .catch(e => {
                console.error(e);
                setLoginLoading(false);
            });
    }
    catch (e) {
        console.error(e);
        setLoginLoading(false);
    }

}

export const getCachedRepositories = async (setAvailableProjects, setProject, setTab) => {
    try {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        await instance.get('/getCachedRepositories', {
            headers: {
                'Access-Control-Allow-Origin': 'https://localhost:5001',
            }
        })
            .then(response => {
                if (response.status === 200) {
                    setAvailableProjects(response.data);
                    if (response.data) {
                        if (response.data.length > 0) {
                            getRemoteCodebaseAnalysis("", response.data[0].number, response.data[0].name, setProject,
                                () => {
                                }, setTab, [], () => {
                                },
                                () => {
                                })
                        }
                    }
                }
            })
            .catch(e => {
                console.error(e);
            });
    }
    catch (e) {
        console.error(e);
    }
}