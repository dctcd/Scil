import React, {useState} from 'react'
import {Box, Button, Hidden, Stack, Typography} from "@mui/material";
import Content from "./Content";
import Commits from "./Commits";
import SyncIcon from "@mui/icons-material/Sync";
import scilLogo from "./resources/Scil.svg";

const refreshButton = () => {
    return ({
        color: "black",
        borderRadius: 2.5,
        backgroundColor: "#FFDD85",
        borderColor: "#FFDD85",
        textTransform: "none",
        width: "110px",
        '&:hover': {borderColor: "#000000", backgroundColor: "#F0F0F0"},
    });
}

const Code = ({project}) => {

    // const [singleFile, setSingleFile] = useState(true);

    const isSingleFile = (project) => {
        return !("files" in project);
    }

    return (
        <div>
            <Stack direction="row">
                <Stack flexGrow={1} height="300px" flexDirection="column">
                    <Box variant="body1" p={2.25} color="#000000" bgcolor="#FFF8E6"
                         sx={{borderRadius: 4, flexGrow: 1, flexDirection: "column", margin: "5px"}}>
                        <Stack direction="row">

                            <Stack direction="column" sx={{flexGrow: 1, justifyContent: "center"}}>
                                <Typography fontSize="32px" display="inline" sx={{
                                    lineHeight: "32px",
                                    marginBottom: "15px"
                                }}>{project.issuesSummaryTitle}</Typography>
                                <Typography fontSize="16px" display="inline" sx={{
                                    lineHeight: "16px",
                                    marginBottom: "15px"
                                }}>{project.issuesSummary}</Typography>
                                <Button startIcon={<SyncIcon/>} type="submit" variant="outlined" sx={refreshButton()}
                                        disableElevation size="large" onClick={() => {
                                }}>
                                    <Typography variant="body1">Refresh</Typography>
                                </Button>
                            </Stack>
                            <img src={scilLogo} style={{height: "150px", margin: "70px"}} alt="Scil"/>
                        </Stack>
                    </Box>
                    {(isSingleFile(project)) && (<Content inputErrors={project.issues} title={project.codeTitle} headline={project.issuesSummaryTitle}
                             description={project.issuesSummary}
                             code={project.code}/>)}
                    {(!isSingleFile(project)) && (
                        project["files"].map((file, index) => (<Content inputErrors={file.issues} title={file.filepath} headline={""}
                             description={""}
                             code={file.code}/>)))}
                    <Hidden mdUp implementation="css">
                        <Commits style={{float: "right"}} commitsInput={[
                            ["Fixed login bug", "Alice", "5 minutes ago", "1 major issue, 2 code quality issues"],
                            ["Refactored user authentication", "Bob", "12 minutes ago", "0 major issues, 1 moderate issue, 3 code quality issues"],
                            ["Updated README with setup instructions", "Charlie", "30 minutes ago", "0 major issues, 0 moderate issues, 1 code quality issue"],
                            ["Added error handling to API requests", "Alice", "1 hour ago", "1 major issue, 0 moderate issues, 2 code quality issues"],
                            ["Improved performance of data fetching", "Dana", "2 hours ago", "0 major issues, 2 moderate issues, 1 code quality issue"],
                            ["Resolved merge conflicts in dashboard module", "Eve", "3 hours ago", "2 major issues, 1 moderate issue, 4 code quality issues"],
                            ["Added unit tests for User model", "Frank", "5 hours ago", "0 major issues, 1 moderate issue, 3 code quality issues"],
                            ["Optimized image loading in the gallery", "Alice", "6 hours ago", "1 major issue, 0 moderate issues, 2 code quality issues"],
                            ["Refactored CSS for responsive layout", "Charlie", "7 hours ago", "0 major issues, 2 moderate issues, 5 code quality issues"],
                            ["Updated package dependencies", "Dana", "1 day ago", "0 major issues, 1 moderate issue, 0 code quality issues"],
                            ["Fixed broken links in footer", "Eve", "2 days ago", "0 major issues, 0 moderate issues, 1 code quality issue"],
                            ["Enhanced security for token storage", "Bob", "3 days ago", "1 major issue, 0 moderate issues, 2 code quality issues"]
                        ]}/>
                    </Hidden>

                </Stack>
                <Hidden mdDown implementation="css">
                    <Box sx={{width: "300px"}}>
                        <Commits commitsInput={[
                            ["Fixed login bug", "Alice", "5 minutes ago", "1 major issue, 2 code quality issues"],
                            ["Refactored user authentication", "Bob", "12 minutes ago", "0 major issues, 1 moderate issue, 3 code quality issues"],
                            ["Updated README with setup instructions", "Charlie", "30 minutes ago", "0 major issues, 0 moderate issues, 1 code quality issue"],
                            ["Added error handling to API requests", "Alice", "1 hour ago", "1 major issue, 0 moderate issues, 2 code quality issues"],
                            ["Improved performance of data fetching", "Dana", "2 hours ago", "0 major issues, 2 moderate issues, 1 code quality issue"],
                            ["Resolved merge conflicts in dashboard module", "Eve", "3 hours ago", "2 major issues, 1 moderate issue, 4 code quality issues"],
                            ["Added unit tests for User model", "Frank", "5 hours ago", "0 major issues, 1 moderate issue, 3 code quality issues"],
                            ["Optimized image loading in the gallery", "Alice", "6 hours ago", "1 major issue, 0 moderate issues, 2 code quality issues"],
                            ["Refactored CSS for responsive layout", "Charlie", "7 hours ago", "0 major issues, 2 moderate issues, 5 code quality issues"],
                            ["Updated package dependencies", "Dana", "1 day ago", "0 major issues, 1 moderate issue, 0 code quality issues"],
                            ["Fixed broken links in footer", "Eve", "2 days ago", "0 major issues, 0 moderate issues, 1 code quality issue"],
                            ["Enhanced security for token storage", "Bob", "3 days ago", "1 major issue, 0 moderate issues, 2 code quality issues"]
                        ]}/>
                    </Box>
                </Hidden>
            </Stack>
        </div>
            )
            }
            export default Code