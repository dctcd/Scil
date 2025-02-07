import React, {useContext, useEffect} from 'react'
import {getAnalysis, getCachedRepositories, getRemoteCodebaseAnalysis, getRepositories} from "./services/api";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {Box, Button, CircularProgress, Modal, Stack, Typography, useTheme} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

import scilLogo from './resources/Scil.svg';
import gitlabButtonIcon from './resources/GitLabButton.svg';
import {AvailableProjectsContext, GitlabContext, ProjectContext, TabContext,} from "./App";
import NavDropdown from 'react-bootstrap/NavDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import SourceIcon from '@mui/icons-material/Source';
import WebIcon from '@mui/icons-material/Web';
import Editor from 'react-simple-code-editor';
import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import {moveSingleAnalysisProjectToTop} from "./services/codeAnalysisService";

const sidebarButtonStyle = () => {
    return ({
        color: "black",
        backgroundColor: "#FFFFFF",
        textTransform: "none",
        padding: 1.5,
        justifyContent: 'flex-start',
        height: "10px"
    });
}

const loginButton = () => {
    return ({
        display: 'flex',
        color: "black",
        borderRadius: 2.5,
        backgroundColor: "#F8F8F8",
        borderColor: "#BDBDBD",
        textTransform: "none",
        height: "55px",
        '&:hover': {borderColor: "#000000", backgroundColor: "#F0F0F0"},
    });
}

const Sidebar = () => {
    const theme = useTheme();
    const {tab, setTab} = useContext(TabContext);
    const {project, setProject} = useContext(ProjectContext);
    const {availableProjects, setAvailableProjects} = useContext(AvailableProjectsContext);
    const [addCodeVisible, setAddCodeVisibility] = React.useState(false);
    const [loadingVisible, setLoadingVisible] = React.useState(false);
    const [codeLineNumbers, setCodeLineNumbers] = React.useState("1");
    const [codeInput, setCodeInput] = React.useState("");
    const [submitType, setSubmitType] = React.useState("");
    const [repositories, setRepositories] = React.useState([]);
    const [gitlabError, setGitlabError] = React.useState("");
    const {gitlabAuthenticated, setGitlabAuthenticated} = useContext(GitlabContext);

    useEffect(() => {
        getCachedRepositories(setAvailableProjects, setProject, setTab);
    }, []);

    const setCodeInputAndLineNumber = (codeInput) => {
        setCodeInput(codeInput);
        let lineNumberString = "1";
        for (let i = 1; i < codeInput.split("\n").length; i++) {
            lineNumberString += "\n" + String(1 + i);
        }
        setCodeLineNumbers(lineNumberString);
    }
    return (<Box>
            <Stack sx={{width: "160px"}}>
                <Box display="flex" justify-content="center" align-items="center" sx={{
                    marginBottom: "25px", paddingTop: 4, paddingLeft: 4
                }}>
                    <img src={scilLogo} height={35} alt="Scil"/>
                    <Typography variant="h5" sx={{marginLeft: "10px"}}>
                        Scil
                    </Typography>
                </Box>
                <NavDropdown title={<span style={{
                    display: "inline-block",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    maxWidth: "120px",
                    marginLeft: "10px",
                    marginRight: "2px"
                }}>
                        {availableProjects.length > 0 ? availableProjects[0].name : "New Project"}
                    </span>}>
                    {availableProjects.map((project, index) => (<>
                            <NavDropdown.Item
                                onClick={() => project.hasOwnProperty("project") ? moveSingleAnalysisProjectToTop(availableProjects, project, setAvailableProjects, setProject) : getRemoteCodebaseAnalysis("", project.number, project.name, setProject, setAddCodeVisibility, setTab, availableProjects, setAvailableProjects, setLoadingVisible)}>
                                    <span style={{
                                        display: "inline-block",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        maxWidth: "125px"
                                    }}>
                                        {project.name}
                                    </span>
                            </NavDropdown.Item>
                        </>))}
                    {(availableProjects.length > 0) && <NavDropdown.Divider/>}
                    <NavDropdown.Item href="#action/3.4" onClick={() => setAddCodeVisibility(true)}>
                        <span style={{
                            display: "inline-block",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            maxWidth: "125px"
                        }}>
                            +  Add Project
                        </span>
                    </NavDropdown.Item>
                </NavDropdown>
                <Box p={2}>
                    {(JSON.stringify(project) !== "{}") && (<Box display="flex" align-items="center" style={{
                        marginBottom: (window.innerWidth >= theme.breakpoints.values.md ? "3px" : "10px")
                    }}>
                        <div style={{
                            display: "inline-block",
                            width: "2px",
                            marginTop: "2px",
                            marginBottom: "2px",
                            background: tab === "Code" ? "#000000" : "#00000000"
                        }}>
                        </div>
                        <Button startIcon={<CodeOutlinedIcon/>} sx={sidebarButtonStyle()}
                                disableElevation size="large" onClick={() => setTab("Code")}>
                            <Typography variant="body1">
                                {"Code"}
                            </Typography>
                        </Button>
                    </Box>)}
                    {(JSON.stringify(project) === "{}") && (<Box display="flex" align-items="center"
                                                                 style={{marginBottom: (window.innerWidth >= theme.breakpoints.values.md ? "3px" : "10px")}}>
                        <div style={{
                            display: "inline-block",
                            width: "2px",
                            background: (tab === "Home" || tab === "About") ? "#000000" : "#00000000",
                            marginTop: "2px",
                            marginBottom: "2px"
                        }}></div>
                        <Button startIcon={<HomeOutlinedIcon/>} sx={sidebarButtonStyle()}
                                disableElevation size="large" onClick={() => setTab("Home")}>
                            <Typography variant="body1">{"Home"}</Typography>
                        </Button>
                    </Box>)}
                    {(JSON.stringify(project) !== "{}") && (<Box display="flex" disabled align-items="center"
                                                                 style={{marginBottom: (window.innerWidth >= theme.breakpoints.values.md ? "3px" : "10px")}}>
                        <div style={{
                            display: "inline-block", width: "2px", background: tab === "Team" ? "#000000" : "#00000000"
                        }}></div>
                        <Button startIcon={<GroupsOutlinedIcon/>} sx={sidebarButtonStyle()}
                                disableElevation size="large" onClick={() => setTab("Team")}>
                            <Typography variant="body1">Team</Typography>
                        </Button>
                    </Box>)}
                    {(JSON.stringify(project) !== "{}") && (<Box display="flex" align-items="center"
                                                                 style={{marginBottom: (window.innerWidth >= theme.breakpoints.values.md ? "3px" : "10px")}}>
                        <div style={{
                            display: "inline-block", width: "2px", background: tab === "About" ? "#000000" : "#00000000"
                        }}></div>
                        <Button startIcon={<InfoOutlinedIcon/>} sx={sidebarButtonStyle()}
                                disableElevation size="large" onClick={() => setTab("About")}>
                            <Typography variant="body1">About</Typography>
                        </Button>
                    </Box>)}

                    <Modal
                        open={addCodeVisible}
                        onClose={() => {
                            setAddCodeVisibility(false)
                        }}
                        aria-labelledby="parent-modal-title-1"
                        style={{display: "flex", alignItems: "center", justifyContent: "center"}}
                    >
                        <Box variant="body1" color="black" bgcolor="#F8F8F8"
                             sx={{borderRadius: 4, marginBottom: 2, minWidth: "420px"}}>
                            <Stack>
                                {(submitType === "") && (<>
                                    <Typography style={{margin: "12px"}} variant="h6" p={1}>Insert Code for
                                        Analysis</Typography>
                                    <Button style={{margin: "12px"}} startIcon={<WebIcon/>} type="submit"
                                            variant="outlined" sx={loginButton()}
                                            disableElevation size="large" onClick={() => {
                                        setSubmitType("inbrowser");
                                    }}>
                                        <Typography variant="body1">Add Using Web Editor</Typography>
                                    </Button>
                                    <Button style={{marginLeft: "12px", marginRight: "12px", marginBottom: "12px"}}
                                            startIcon={<SourceIcon/>} type="submit" variant="outlined"
                                            sx={loginButton()}
                                            disableElevation size="large" onClick={() => {
                                        setSubmitType("local");
                                    }}>
                                        <Typography variant="body1">Select Local Repository</Typography>
                                    </Button>
                                    <Button style={{marginLeft: "12px", marginRight: "12px", marginBottom: "12px"}}
                                            type="submit" variant="outlined" sx={{
                                        display: 'flex',
                                        color: "black",
                                        borderRadius: 2.5,
                                        backgroundColor: gitlabAuthenticated ? "#FC6D26" : "#FC6D2699",
                                        borderColor: "#00000000",
                                        textTransform: "none",
                                        padding: "5px",
                                        height: "55px",
                                        '&:hover': {backgroundColor: "#FC6D2699"}
                                    }}
                                            disableElevation size="large" disabled={!gitlabAuthenticated}
                                            onClick={() => {
                                                setSubmitType("gitlab");
                                                getRepositories(setRepositories, setGitlabError);
                                            }}>
                                        <Stack direction="row" sx={{alignItems: "center"}}>
                                            <img src={gitlabButtonIcon} height="45px" alt="GitLab"/>
                                            {(!gitlabAuthenticated) && (<Typography variant="body1" color="white">(Requires
                                                sign-in)</Typography>)}
                                        </Stack>
                                    </Button></>)}
                                {(submitType === "inbrowser") && (<><Typography style={{margin: "12px"}} variant="h6"
                                                                                p={1}>Code Editor</Typography>
                                    <Box style={{
                                        maxHeight: "calc(100vh - 180px)", overflowX: "auto", whiteSpace: "nowrap"
                                    }}>
                                        <Stack direction="horizontal"
                                               style={{background: "#EBEBEB", overflowY: "scroll"}}>
                                            <div style={{
                                                paddingTop: 10,
                                                paddingLeft: 5,
                                                paddingRight: 5,
                                                fontSize: 12,
                                                whiteSpace: "pre-wrap",
                                                background: "#CFCFCF"
                                            }}>{codeLineNumbers}</div>
                                            <Box style={{
                                                minWidth: window.innerWidth >= theme.breakpoints.values.md ? "400px" : "calc(100vw - 60px)",
                                                maxWidth: window.innerWidth >= theme.breakpoints.values.md ? "calc(100vw - 380px)" : "calc(100vw - 60px)",
                                                whiteSpace: "nowrap"
                                            }}>
                                                <Editor
                                                    value={codeInput}
                                                    onValueChange={codeInput => setCodeInputAndLineNumber(codeInput)}

                                                    highlight={codeInput => highlight(codeInput, languages.js)}
                                                    padding={10}
                                                    sx={{wordBreak: "false"}}
                                                    style={{
                                                        fontSize: 12,
                                                        display: "inline-block",
                                                        minWidth: "100%",
                                                        overflowX: "visible",
                                                        whiteSpace: "nowrap"
                                                    }}
                                                />
                                            </Box>
                                        </Stack>
                                    </Box>
                                    <Typography variant="caption" style={{
                                        overflowX: "wrap",
                                        wordBreak: "break-word",
                                        width: "100%",
                                        paddingTop: "10px",
                                        textAlign: "center",
                                        paddingLeft: "10px",
                                        paddingRight: "10px"
                                    }}>
                                        Ensure code does not include personally identifiable information
                                    </Typography>
                                    <Button style={{margin: "12px"}} startIcon={<AddIcon/>} type="submit"
                                            variant="outlined" sx={loginButton()}
                                            disableElevation size="large" onClick={() => {
                                        setLoadingVisible(true);
                                        getAnalysis(codeInput, setProject, setAddCodeVisibility, setTab, availableProjects, setAvailableProjects, setLoadingVisible);
                                        setSubmitType("");
                                        setAddCodeVisibility(false);
                                    }}>
                                        <Typography variant="body1">Add</Typography>
                                    </Button></>)}
                                {(submitType === "gitlab") && (<><Typography style={{margin: "12px"}} variant="h6"
                                                                             p={1}>GitLab Repositories</Typography>
                                    <Box style={{
                                        maxHeight: "calc(100vh - 200px)",
                                        overflowY: "scroll",
                                        display: "flex",
                                        flexDirection: "column",
                                        padding: "10px"
                                    }}>
                                        {repositories.map((repository, index) => (<Button
                                                style={{marginLeft: "12px", marginRight: "12px", marginBottom: "12px"}}
                                                type="submit" variant="outlined" sx={loginButton()}
                                                disableElevation size="large" onClick={() => {
                                                setLoadingVisible(true);
                                                getRemoteCodebaseAnalysis(repository.url, repository.id, repository.name, setProject, setAddCodeVisibility, setTab, availableProjects, setAvailableProjects, setLoadingVisible);
                                                setSubmitType("");
                                                setAddCodeVisibility(false);
                                            }}>
                                                <Typography variant="body1">{repository.name}</Typography>
                                            </Button>))}
                                    </Box>
                                    <Typography variant="caption" style={{
                                        overflowX: "wrap",
                                        wordBreak: "break-word",
                                        width: "100%",
                                        paddingBottom: "15px",
                                        textAlign: "center",
                                        paddingLeft: "10px",
                                        paddingRight: "10px"
                                    }}>
                                        Ensure codebase does not include personally identifiable information
                                    </Typography>
                                </>)}

                                {(submitType !== "") && (<>
                                    <Button style={{marginLeft: "12px", marginRight: "12px", marginBottom: "12px"}}
                                            type="submit" variant="outlined" sx={loginButton()}
                                            disableElevation size="large" onClick={() => {
                                        setSubmitType("");
                                    }}>
                                        <Typography variant="body1">Go Back</Typography>
                                    </Button></>)}
                            </Stack>
                        </Box>
                    </Modal>
                </Box>
            </Stack>
            <Modal
                open={loadingVisible}
                aria-labelledby="parent-modal-title-1"
                style={{display: "flex", alignItems: "center", justifyContent: "center"}}
            >
                <Box variant="body1" color="black" bgcolor="#F8F8F8"
                     sx={{borderRadius: 4, padding: "15px"}}>
                    <Stack direction="row">
                        <CircularProgress color="inherit" style={{marginTop: "2px"}}/>
                        <Stack style={{marginLeft: "15px"}}>
                            <Typography variant="caption" color="gray">OpenAI GPT-4o</Typography>
                            <Typography>Processing your code</Typography>
                        </Stack>
                    </Stack>
                </Box>
            </Modal>
        </Box>

    )
}
export default Sidebar