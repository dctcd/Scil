import React, {useState} from 'react'
import {Box, Button, Typography} from "@mui/material";
import userImage from "./resources/User.svg";
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {formatTimestamp} from "./services/codeAnalysisService";

const Commits = ({commits}) => {
    return (
        <Box variant="body1" color="#000000" bgcolor="#FFF8E6" marginRight="10px" marginTop="5px" marginLeft="7px"
             sx={{borderRadius: 4, marginBottom: 2}}>
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
                                <Typography variant="caption">{new Date().toDateString()}</Typography>
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
    )
}

export default Commits