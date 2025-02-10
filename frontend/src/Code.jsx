import React from 'react'
import {Box, Button, Hidden, Modal, Stack, Typography} from "@mui/material";
import Content from "./Content";
import Commits from "./Commits";
import ChatIcon from '@mui/icons-material/Chat';
import scilLogo from "./resources/Scil.svg";

const refreshButton = () => {
    return ({
        color: "black",
        borderRadius: 2.5,
        backgroundColor: "#FFDD85",
        borderColor: "#FFDD85",
        textTransform: "none",
        width: "125px",
        '&:hover': {borderColor: "#000000", backgroundColor: "#F0F0F0"},
    });
}

const Code = ({project}) => {
    const isSingleFile = (project) => {
        return !("files" in project);
    }
    const [feedbackDialogVisible, setFeedbackDialogVisible] = React.useState(false);
    return (
        <div>
            <Stack direction="row">
                <Stack flexGrow={1} height="300px" flexDirection="column">
                    <Box variant="body1" p={2.25} color="#000000" bgcolor="#FFF8E6"
                         sx={{borderRadius: 4, flexGrow: 1, flexDirection: "column", margin: "5px"}}>
                        <Stack direction="row">
                            <Stack direction="column" sx={{flexGrow: 1, justifyContent: "center"}}>
                                <Box style={{paddingLeft: "5px", paddingRight: "5px", marginBottom: "8px",
                                    backgroundColor: "black", color: "white", flexBasis: "content",
                                    width: "fit-content", borderRadius: "8px"}}>
                                    <Typography variant="subtitle2">
                                        {project.source}
                                    </Typography>
                                </Box>
                                <Typography fontSize="32px" display="inline" sx={{lineHeight: "32px",
                                    marginBottom: "15px"
                                }}>
                                    {project.issuesSummaryTitle}
                                </Typography>
                                <Typography fontSize="16px" display="inline" sx={{lineHeight: "16px",
                                    marginBottom: "15px"
                                }}>
                                    {project.issuesSummary}
                                </Typography>
                                {
                                        <Button startIcon={<ChatIcon/>} type="submit" variant="outlined"
                                                sx={refreshButton()} disableElevation size="large" onClick={() => setFeedbackDialogVisible(true)}>
                                            <Typography variant="body1">Feedback</Typography>
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
                                <Button style={{margin: "12px"}} startIcon={<ChatIcon/>} type="submit"
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
                                    let projectWithoutCommits = JSON.parse(JSON.stringify(project));
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
                                }}>
                                    <Typography variant="body1">Copy to Clipboard & Go to Forms</Typography>
                                </Button>
                            </Stack>
                        </Box>
                        </Modal>

                    </Box>
                    <Hidden mdUp implementation="css">
                        <Commits style={{float: "right"}} files={project["files"]} commits={[]}/>
                    </Hidden>
                    {
                        (isSingleFile(project)) && (
                            <Content inputErrors={project.issues} description={project.issuesSummary} title={[
                                "This analysis will be lost after the page is closed, please use GitLab function to keep history"
                            ]} headline={project.issuesSummaryTitle} code={project.code}/>
                        )
                    }
                    {
                        (!isSingleFile(project)) && (
                        project["files"].map((file, index) => (
                            <Content inputErrors={file.issues} title={file.filepath}
                                headline={""} description={""} code={file.code}/>
                        )))
                    }
                    <Hidden mdUp implementation="css">
                        <Commits style={{float: "right"}} commits={project.commits ? project.commits : [{authored_date: "Now", message: "Uploaded code via web editor", author_name: "You"}]}/>
                    </Hidden>
                </Stack>
                <Hidden mdDown implementation="css">
                    <Box sx={{width: "300px"}}>
                        <Commits files={project["files"]} commits={project.commits ? project.commits : [{authored_date: "Now", message: "Uploaded code via web editor", author_name: "You"}]}/>
                    </Box>
                </Hidden>
            </Stack>
        </div>
    )
}
export default Code