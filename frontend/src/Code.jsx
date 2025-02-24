import React, {useContext} from 'react'
import {Box, Button, CircularProgress, Hidden, Modal, Stack, Typography} from "@mui/material";
import Content from "./Content";
import Commits from "./Commits";
import ChatIcon from '@mui/icons-material/Chat';
import scilLogo from "./resources/Scil.svg";
import {AvailableProjectsContext, ProjectContext} from "./App";
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import {analyseUpdatedBranch} from "./services/api";

const Code = () => {
    const {availableProjects, setAvailableProjects} = useContext(AvailableProjectsContext);
    const {project, setProject} = useContext(ProjectContext);
    const isSingleFile = (project) => {
        return !("files" in project);
    }

    const [feedbackDialogVisible, setFeedbackDialogVisible] = React.useState(false);
    const [projectAnalysisVersion, setProjectAnalysisVersion] = React.useState(0);
    const [loadingVisible, setLoadingVisible] = React.useState(false);
    const [loadingProblem, setLoadingProblem] = React.useState(false);
    const [feedbackGiven, setFeedbackGiven] = React.useState(false);
    return (
        <div>
            <Stack direction="row">
                <Stack flexGrow={1} height="300px" flexDirection="column">
                    {(project.length > 1) && (<Stack direction="row" style={{display: "flex", marginLeft: "5px"}}>
                        {project.map((projectButton, index) => (
                            <Button style={{textTransform: "none", backgroundColor: (projectAnalysisVersion === index) ? "#FFDD85" : "#FFF8E6", borderRadius: "15px", flexGrow: 1, marginRight: "5px", color: "#000000"}} onClick={()=>{setProjectAnalysisVersion(index)}}>
                                {project ? (project[index] ? Object.keys(project[index])[0] : "No name") : "No project"}
                            </Button>
                        ))}
                        <Button disabled={loadingVisible} style={{backgroundColor: "#FFF8E6", borderRadius: "15px", marginRight: "5px", color: "#000000"}} onClick={()=>{setLoadingVisible(true); analyseUpdatedBranch(availableProjects[0].number, setProject, setLoadingVisible, setLoadingProblem);}}>
                            {/*<SyncRoundedIcon/>*/}
                            {loadingVisible ? <CircularProgress color="inherit" size="12px"/> :
                                (loadingProblem ? <SyncProblemIcon color="inherit" size="12px"/> : <SyncRoundedIcon/>)}
                        </Button>
                    </Stack>)}
                    <Box variant="body1" p={2.25} color="#000000" bgcolor="#FFF8E6"
                         sx={{borderRadius: 4, flexGrow: 1, flexDirection: "column", margin: "5px"}}>
                        <Stack direction="row">
                            <Stack direction="column" sx={{flexGrow: 1, justifyContent: "center"}}>
                                <Box style={{paddingLeft: "5px", paddingRight: "5px", marginBottom: "8px",
                                    backgroundColor: "black", color: "white", flexBasis: "content",
                                    width: "fit-content", borderRadius: "8px"}}>
                                    <Typography variant="subtitle2">
                                        {project ? project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]].source : ""}
                                    </Typography>
                                </Box>
                                <Typography fontSize="32px" display="inline" sx={{lineHeight: "32px",
                                    marginBottom: "15px"
                                }}>
                                    {project ? project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]].issuesSummaryTitle : ""}
                                </Typography>
                                <Typography fontSize="16px" display="inline" sx={{lineHeight: "16px",
                                    marginBottom: "15px"
                                }}>
                                    {project ? project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]].issuesSummary : ""}
                                </Typography>
                                {
                                        <Button type="submit" variant="outlined"
                                                sx={{color: "black",
        borderRadius: 2.5,
        backgroundColor: "#FFDD85",
        borderColor: "#FFDD85",
        textTransform: "none",
        justifyContent: "flex-start",
        display: "flex",
        '&:hover': {borderColor: "#000000", backgroundColor: "#F0F0F0"},
        width: (project.length < 2) ? "340px" : "165px"}} disableElevation size="large" onClick={() => setFeedbackDialogVisible(true)}>
                                            <ChatIcon sx={{marginRight: "15px"}}/>
                                            {(project.length < 2) && (<SyncRoundedIcon style={{height: "15px", position: "absolute",  left: "2px"}}/>)}
                                            <Typography variant="body1">{(project.length > 1) ? "Feedback" : "Feedback & Analyse New Commits"}</Typography>
                                        </Button>

                                }
                            </Stack>
                            <img src={scilLogo} style={{height: "150px", margin: "70px"}} alt="Scil"/>
                        </Stack>




                        <Modal
                        open={feedbackDialogVisible}
                        onClose={() => {
                            setFeedbackDialogVisible(false)
                        }}
                        aria-labelledby="parent-modal-title-1"
                        style={{display: "flex", alignItems: "center", justifyContent: "center"}}
                    >
                        <Box variant="body1" color="black" bgcolor="#F8F8F8"
                             sx={{borderRadius: 4, marginBottom: 2, maxWidth: "420px"}}>
                            <Stack>
                                <Typography style={{margin: "12px"}} variant="h6" p={1}>Give Feedback</Typography>
                                <Typography style={{margin: "12px"}} variant="body" p={1}>
                                    You will now be redirected to Microsoft Forms. The current projects' analysis will
                                    be copied to your clipboard, please paste this into the indicated field. This will
                                    be anonymised and any irrelevant lines of code will be removed. The form will take
                                    about two minutes, thank you for taking the time to give feedback!
                                </Typography>
                                <Button style={{marginLeft: "12px", marginRight: "12px"}} startIcon={<ChatIcon/>} type="submit"
                                        variant="outlined" sx={{
                                    display: 'flex',
                                    color: "black",
                                    borderRadius: 2.5,
                                    backgroundColor: "#F8F8F8",
                                    borderColor: "#BDBDBD",
                                    textTransform: "none",
                                    height: "55px",
                                    '&:hover': {borderColor: "#000000", backgroundColor: "#F0F0F0"}

                                }} onClick={() => {
                                    let projectWithoutCommits = JSON.parse(JSON.stringify(project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]]));
                                    projectWithoutCommits.commits = [];
                                    if (projectWithoutCommits.hasOwnProperty("files")) {
                                        for (var filesIndex = 0; filesIndex < projectWithoutCommits.files.length; filesIndex++) {
                                            let file = projectWithoutCommits.files[filesIndex];
                                            let fileCode = file.code.split("\n");
                                            var codeInAnalysis = new Set();
                                            for (var issueIndex = 0; issueIndex < file.issues.length; issueIndex++) {
                                                let issue = file.issues[issueIndex];
                                                for (var lineNoNo = 0; lineNoNo < issue.lineNumbers.length; lineNoNo++) {
                                                    codeInAnalysis.add(String(issue.lineNumbers[lineNoNo]) + " " + fileCode[issue.lineNumbers[lineNoNo] - 1]);
                                                }
                                            }
                                            projectWithoutCommits.files[filesIndex].code = Array.from(codeInAnalysis).join(' ');
                                        }
                                    }
                                    else {
                                        let fileCode = projectWithoutCommits.code.split("\n");
                                        var codeInSingleAnalysis = new Set();
                                        for (var issueSingleIndex = 0; issueSingleIndex < projectWithoutCommits.issues.length; issueSingleIndex++) {
                                                let issue = projectWithoutCommits.issues[issueSingleIndex];
                                                for (var singleLineNoNo = 0; singleLineNoNo < issue.lineNumbers.length; singleLineNoNo++) {
                                                    codeInSingleAnalysis.add(String(issue.lineNumbers[singleLineNoNo]) + " " + fileCode[issue.lineNumbers[singleLineNoNo] - 1]);
                                                }
                                            }
                                            projectWithoutCommits.code = Array.from(codeInSingleAnalysis).join(' ');
                                    }
                                    navigator.clipboard.writeText(JSON.stringify(projectWithoutCommits));
                                    window.open("https://forms.office.com/e/A3U9znyias", "_blank").focus();
                                    setFeedbackGiven(true);
                                }}>
                                    <Typography variant="body1">Copy to Clipboard & Go to Forms</Typography>
                                </Button>
                                <Button onClick={() => {setLoadingVisible(true); analyseUpdatedBranch(availableProjects[0].number, setProject, setLoadingVisible, setLoadingProblem);}}
                                        style={{margin: "12px"}} type="submit"
                                        variant="outlined" disabled={feedbackGiven ? (loadingVisible) : true } sx={{
                                    display: 'flex',
                                    color: "black",
                                    borderRadius: 2.5,
                                    backgroundColor: "#F8F8F8",
                                    borderColor: "#BDBDBD",
                                    textTransform: "none",
                                    height: "55px",
                                    '&:hover': {borderColor: "#000000", backgroundColor: "#F0F0F0"}
                                }}>
                                    {(!loadingVisible) && (
                                        <>
                                            <SyncRoundedIcon/>
                                            <Typography variant="body1">
                                                {feedbackGiven ? "Analyse New Commits" : "Give feedback to analyse new commits"}
                                            </Typography>
                                        </>)}
                                    {(loadingVisible) && (
                                        <>
                                        <CircularProgress size="15px" style={{marginRight: "10px", color: "#999999"}}/>
                                            <Typography variant="body1">
                                                Analysing, please wait...
                                            </Typography>
                                        </>)}
                                </Button>
                            </Stack>
                        </Box>
                        </Modal>

                    </Box>
                    <Hidden mdUp implementation="css">
                        <Commits style={{float: "right"}} files={project["files"]} commits={[]}/>
                    </Hidden>
                    {
                        (isSingleFile(project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]])) && (
                            <Content inputErrors={project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]].issues} description={project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]].issuesSummary} title={[
                                "This analysis will be lost after the page is closed, please use GitLab function to keep history"
                            ]} headline={project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]].issuesSummaryTitle} code={project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]].code}/>
                        )
                    }
                    {
                        (!isSingleFile(project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]])) && (
                        project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]]["files"].map((file, index) => (
                            <Content inputErrors={file.issues} title={file.filepath}
                                headline={""} description={""} code={file.code}/>
                        )))
                    }
                    <Hidden mdUp implementation="css">
                        <Commits style={{float: "right"}} commits={project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]].commits ? project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]].commits : [{authored_date: "Now", message: "Uploaded code via web editor", author_name: "You"}]}/>
                    </Hidden>
                </Stack>
                <Hidden mdDown implementation="css">
                    <Box sx={{width: "300px"}}>
                        <Commits files={project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]]["files"]} commits={project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]].commits ? project[projectAnalysisVersion][Object.keys(project[projectAnalysisVersion])[0]].commits : [{authored_date: "Now", message: "Uploaded code via web editor", author_name: "You"}]}/>
                    </Box>
                </Hidden>
            </Stack>
        </div>
    )
}
export default Code