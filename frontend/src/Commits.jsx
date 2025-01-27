import React, {useState} from 'react'
import {Box, Button, Typography} from "@mui/material";
import userImage from "./resources/User.svg";
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

const Commits = ({commitsInput}) => {
    const [commits, setCommits] = useState(commitsInput);
    return (
        <Box variant="body1" color="#000000" bgcolor="#FFF8E6" marginRight="10px" marginTop="5px" marginLeft="7px"
             sx={{borderRadius: 4, marginBottom: 2}}>
            {commits.map((commit, index) => (
                <>
                    <Button key={"commit " + index + " button"} fullWidth sx={{borderRadius: 4}} style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "15px",
                        textTransform: "none",
                        color: "black",
                        alignItems: "flex-start",
                        textAlign: "left"
                    }}>
                        <Box key={"commit " + index + " box"} sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            marginBottom: "5px"
                        }}>
                            <img key={"commit " + index + " img"} src={userImage} height={35} alt="User"
                                 style={{marginRight: "10px"}}/>
                            <Box key={"commit " + index + " typography button"}
                                 sx={{display: "flex", flexDirection: "column"}}>
                                <Typography key={"commit " + index + " title"}
                                            variant="caption">{commit[1]} • {commit[2]}</Typography>
                                <Typography key={"commit " + index + " description"}>{commit[0]}</Typography>
                            </Box>
                        </Box>
                        <Box key={"commit " + index + " warnings"}
                             sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                            <WarningAmberOutlinedIcon key={"commit " + index + " warn"} style={{height: "15px"}}/>
                            <Typography key={"commit " + index + " warning description"}>{commit[3]}</Typography>
                        </Box>
                    </Button>
                </>
            ))}
        </Box>
    )
}

export default Commits