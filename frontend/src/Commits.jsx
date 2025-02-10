import React from 'react'
import {Box, Button, Stack, Typography} from "@mui/material";
import userImage from "./resources/User.svg";
import {countErrorsOfType, formatTimestamp, isErrorsOfType} from "./services/codeAnalysisService";

const Commits = ({commits, files}) => {
    return (
        <Stack>
            {(files) && (<Box variant="body1" color="#000000" bgcolor="#FFF8E6" marginRight="10px" marginTop="5px" marginLeft="7px" paddingTop="5px" paddingBottom="5px"
             sx={{borderRadius: 4, marginBottom: "10px"}}>
                <Stack>
                    {files.map((file, index) => (
<Box  sx={{borderRadius: 4}} style={{
                        display: "flex",
                        flexDirection: "column",
                        paddingLeft: "15px",
                        color: "black",
                        alignItems: "flex-start",
                        textAlign: "left",
                        overflowX: "wrap",
                        wordBreak: "break-word",
                        marginTop: "5px",
                        marginBottom: "5px",
                    }}>
    <Typography variant="caption" color="#00000099">{file.filepath[0].includes("/") ?
                        file.filepath[0].substring(0, file.filepath[0].lastIndexOf("/")+1): ""}</Typography>
                <Stack direction="row" style={{justifyContent: "space-between", width: "100%", paddingRight: "10px"}}>
    <Typography variant="title" style={{marginLeft: "2px"}}>{file.filepath[0].includes("/") ?
                        file.filepath[0].substring(file.filepath[0].lastIndexOf("/")+1) : file.filepath[0]}</Typography>
                    <Stack direction="row" style={{alignItems: "center"}}>
                        {(isErrorsOfType("majorIssue", file.issues)) && (<Box style={{borderRadius: "5px", height: "15px", width: "15px", backgroundColor: "#F18787", color: "#FFFFFF", fontSize: "11px", fontWeight: "bold", alignContent: "center", textAlign: "center"}}>{countErrorsOfType("majorIssue", file.issues)}</Box>)}
                        {(isErrorsOfType("moderateIssue", file.issues)) && (<Box style={{borderRadius: "5px", height: "15px", width: "15px", backgroundColor: "#FFDD85", color: "#000000", fontSize: "11px", fontWeight: "bold", alignContent: "center", textAlign: "center",  marginLeft: "5px"}}>{countErrorsOfType("moderateIssue", file.issues)}</Box>)}
                        {(isErrorsOfType("codeQualityIssue", file.issues)) && (<Box style={{borderRadius: "5px", height: "15px", width: "15px", backgroundColor: "#000000", color: "#FFFFFF", fontSize: "11px", fontWeight: "bold", alignContent: "center", textAlign: "center", marginLeft: "5px"}}>{countErrorsOfType("codeQualityIssue", file.issues)}</Box>)}
                    </Stack>
                </Stack>
</Box>))}
                    </Stack>
        </Box>)}

        <Box variant="body1" color="#000000" bgcolor="#FFF8E6" marginRight="10px" marginTop="5px" marginLeft="7px"
             sx={{borderRadius: 4, marginBottom: 2,
                        overflowX: "wrap",
                        wordBreak: "break-word"}}>
            {commits ? commits.map((commit, index) => (
                <>
                    <Button fullWidth sx={{borderRadius: 4}} style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "15px",
                        textTransform: "none",
                        color: "black",
                        alignItems: "flex-start",
                        textAlign: "left"
                    }}>
                        <Box sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            marginBottom: "5px"
                        }}>
                            <img src={userImage} height={35} alt="User"
                                 style={{marginRight: "10px"}}/>
                            <Box key={"commit " + index + " typography button"}
                                 sx={{display: "flex", flexDirection: "column"}}>
                                <Typography variant="caption">{formatTimestamp(commit.authored_date)}</Typography>
                                {/*<Typography variant="caption">{commit.authored_date}</Typography>*/}
                                <Typography >{commit.author_name}</Typography>
                            </Box>
                        </Box>
                        <Box
                             sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                            {/*<WarningAmberOutlinedIcon key={"commit " + index + " warn"} style={{height: "15px"}}/>*/}
                            <Typography>{commit.message} </Typography>
                        </Box>
                    </Button>
                </>
            )) : (<Box sx={{padding: "10px"}}>
                <Box sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            marginBottom: "5px"
                        }}>
                            <img src={userImage} height={35} alt="User"
                                 style={{marginRight: "10px"}}/>
                            <Box sx={{display: "flex", flexDirection: "column"}}>
                                <Typography variant="caption">{new Date().toTimeString().substring(0,5)}</Typography>
                                {/*<Typography variant="caption">{commit.authored_date}</Typography>*/}
                                <Typography>You</Typography>
                            </Box>
                        </Box>
                        <Box
                             sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                            {/*<WarningAmberOutlinedIcon key={"commit " + index + " warn"} style={{height: "15px"}}/>*/}
                            <Typography>Uploaded code via web editor </Typography>
                        </Box>
            </Box>)}
        </Box>
            </Stack>
    )
}

export default Commits