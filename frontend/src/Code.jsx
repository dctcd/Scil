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
                                <Box style={{paddingLeft: "5px", paddingRight: "5px", marginBottom: "8px", backgroundColor: "black", color: "white", flexBasis: "content", width: "fit-content", borderRadius: "8px"}}>
                                    <Typography variant="subtitle2">{project.source}</Typography>
                                </Box>
                                <Typography fontSize="32px" display="inline" sx={{
                                    lineHeight: "32px",
                                    marginBottom: "15px"
                                }}>{project.issuesSummaryTitle}</Typography>
                                <Typography fontSize="16px" display="inline" sx={{
                                    lineHeight: "16px",
                                    marginBottom: "15px"
                                }}>{project.issuesSummary}</Typography>
                                {(project.hasOwnProperty("commits")) && (project.commits && (<Button startIcon={<SyncIcon/>} type="submit" variant="outlined" sx={refreshButton()}
                                        disableElevation size="large" onClick={() => {
                                }}>
                                    <Typography variant="body1">Refresh</Typography>
                                </Button>))}
                            </Stack>
                            <img src={scilLogo} style={{height: "150px", margin: "70px"}} alt="Scil"/>
                        </Stack>
                    </Box>
                    {(isSingleFile(project)) && (<Content inputErrors={project.issues} title={["This analysis will be lost after the page is closed, please use GitLab function to keep history"]} headline={project.issuesSummaryTitle}
                             description={project.issuesSummary}
                             code={project.code}/>)}
                    {(!isSingleFile(project)) && (
                        project["files"].map((file, index) => (<Content inputErrors={file.issues} title={file.filepath} headline={""}
                             description={""}
                             code={file.code}/>)))}
                    <Hidden mdUp implementation="css">
                        <Commits style={{float: "right"}} commits={project.commits} files={project["files"]}/>
                    </Hidden>

                </Stack>
                <Hidden mdDown implementation="css">
                    <Box sx={{width: "300px"}}>
                        <Commits commits={project.commits} files={project["files"]}/>
                    </Box>
                </Hidden>
            </Stack>
        </div>
            )
            }
            export default Code