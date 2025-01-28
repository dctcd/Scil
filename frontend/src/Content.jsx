import React, {useEffect, useState} from 'react'
import {Box, Button, Hidden, Stack, TextField, Typography, useTheme, UseEffect} from "@mui/material";
import axios from "axios";
import scilLogo from "./resources/Scil.svg";
import SyncIcon from '@mui/icons-material/Sync';
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import userImage from "./resources/User.svg";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import WarningTwoToneIcon from '@mui/icons-material/WarningTwoTone';
import ReportIcon from '@mui/icons-material/Report';
import CodeOffIcon from '@mui/icons-material/CodeOff';
import {highlight, languages} from "prismjs/components/prism-core";
import Editor from "react-simple-code-editor";
import parse from 'html-react-parser';
import {highlightAndFormatWhitespace} from "./services/codeAnalysisService";

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

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const instance = axios.create({
    baseURL: 'https://localhost:5000',
    timeout: 1000,
    rejectUnauthorized: false,
});

const Content = ({inputErrors, title, headline, description, code}) => {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [token, setToken] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);
    const refresh = async () => {

        let username_cookie = document.cookie.split('; ').find(cookie => cookie.startsWith('username='));
        if (username_cookie) {
            username_cookie = username_cookie.split('=')[1];
            setUsername(username_cookie);
        }
        let name_cookie = document.cookie.split('; ').find(cookie => cookie.startsWith('name='));
        if (name_cookie) {
            name_cookie = name_cookie.split('=')[1];
            setName(name_cookie);
        }
        let token_cookie = document.cookie.split('; ').find(cookie => cookie.startsWith('token='));
        if (token_cookie) {
            token_cookie = token_cookie.split('=')[1];
            setToken(token_cookie);
        }
        await getMessages(name_cookie, username_cookie, token_cookie);
    };

    const [messages, setMessages] = useState([]);

    const getMessages = async (name_cookie, username_cookie, token_cookie) => {
        try {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
            await instance.post('/getMessages', {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                },
                username: username_cookie, token: token_cookie
            })
                .then(response => {
                    setMessages(response.data.messages);
                    setLoggedIn(true);
                    return true;
                })
                .catch(_ => {
                    setLoggedIn(false);
                    return false;
                });
        } catch (e) {
            if (e instanceof Error) alert(e);
        }
        return false;
    }

    const sendMessage = async () => {
        try {
            refresh();
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
            await instance.post('/sendMessage', {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                },
                name: name, message: message, username: username, token: token
            })
                .then(response => {
                    refresh();
                    return true;
                })
                .catch(_ => {
                    return false;
                });
        } catch (e) {
            if (e instanceof Error) alert(e);
        }
        return false;
    }

    const [message, setMessage] = useState("");
    const handleInput = (message) => {
        setMessage(message);
    };

    const codeQualityIssue =
        <Box variant="body1" p="5px" color="#FFFFFF" bgcolor="#000000"
                 sx={{borderRadius: "10px", marginBottom:"10px", display: "flex"}}>
            <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <CodeOffIcon style={{height: "20px", color: "#FFFFFF", marginRight: "5px"}}/>
                <Typography>Code Quality</Typography>
            </Box>
        </Box>;

    const moderateIssue =
        <Box variant="body1" p="5px" color="#000000" bgcolor="#FFDD85"
                sx={{borderRadius: "10px", marginBottom:"10px", display: "flex"}}>
            <Box sx={{display: "flex", flexDirection: "row", alignItems: "center", flexGrow:1, width:"100%"}}>
                <WarningAmberOutlinedIcon style={{height: "20px", color: "#000000", marginRight: "5px"}}/>
                <Typography>Moderate</Typography>
            </Box>
        </Box>;

    const majorIssue =
        <Box variant="body1" p="5px" color="#FFFFFF" bgcolor="#F18787"
                 sx={{borderRadius: "10px", marginBottom:"10px", display: "flex"}}>
            <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <ReportIcon style={{height: "20px", color: "#FFFFFF", marginRight: "5px"}}/>
                <Typography>Major</Typography>
            </Box>
        </Box>;

    // const [errors, setErrors] = useState(inputErrors);

    const theme = useTheme();

    // const [contentWidth, setContentWidth] = React.useState(window.innerWidth);


    // const handleWindowSizeChange = useEffect(() => {
    // // action on update of movies
    //
    //     if (window.innerWidth >= theme.breakpoints.values.md) {
    //         setContentWidth((window.innerWidth-460).toString() + "px");
    //     } else {
    //         setContentWidth(window.innerWidth.toString() + "px");
    //     }
    //     console.log((window.innerWidth-460).toString() + "px wide | " + + window.innerWidth.toString() + "px mobile | contentWidth:  " + contentWidth);
    // }, [contentWidth])
    //
    // useEffect(() => {
    //     window.addEventListener('resize', handleWindowSizeChange);
    //     return () => {
    //         window.removeEventListener('resize', handleWindowSizeChange);
    //     };
    // }, []);

    const errorStackStyle = () => {
        return {
            maxWidth: (window.innerWidth >= theme.breakpoints.values.md ? "calc(100vw - 475px)" : "calc(100vw - 15px)"),  display: "flex", flexDirection: "column", marginBottom: "5px", marginTop: "5px", marginLeft: "5px"
        };
    };


    return (

        <div style={errorStackStyle()}>


            <Box variant="body1" p={2.25} color="#000000" bgcolor="#FFF8E6"
                 sx={{borderRadius: 4, flexGrow: 1, flexDirection: "column", marginBottom: "10px"}}>
                <Stack direction="row">

                    <Stack direction="column" sx={{flexGrow: 1, justifyContent: "center"}}>
                        <Typography fontSize="32px" display="inline" sx={{lineHeight: "32px", marginBottom: "15px"}}>{headline}</Typography>
                        <Typography fontSize="16px" display="inline" sx={{lineHeight: "16px", marginBottom: "15px"}}>{description}</Typography>
                        <Button startIcon={<SyncIcon/>} type="submit" variant="outlined" sx={refreshButton()}
                            disableElevation size="large" onClick={refresh}>
                            <Typography variant="body1">Refresh</Typography>
                        </Button>
                    </Stack>
                    <img src={scilLogo} style={{height: "150px", margin: "70px"}} alt="Scil"/>
                </Stack>
            </Box>
            <Box sx={{borderRadius: 4, flexGrow: 1, flexDirection: "column", overflowX: "scroll", /*width: "900px",*/ overflow: "hidden"}}>
            <Stack direction="row" sx={{overflowX: "auto"}}> {/* Copilot generated - BEGIN*/}
    {(inputErrors).map((error, index) => (
        <Button key={index + "button"} fullWidth sx={{ borderRadius: "20px" }} style={{ background: "#FFF8E6", display: "flex", flexDirection: "row", textTransform: "none", color: "black", marginRight: "10px", alignItems: "flex-start", width: "150px", flexShrink: 0 }}>
            <Box key={index + "box"} sx={{  flexDirection: "row", alignItems: "stretch", width: "100%", marginTop: "5px" }}>
                {error.type === "codeQualityIssue" ? codeQualityIssue : (error.type === "moderateIssue" ? moderateIssue : majorIssue)}
                <Typography sx={{lineHeight: "16px", marginBottom: "10px"}} key={index + "title"}>{error.title}</Typography>
                <Typography sx={{lineHeight: "14px", marginBottom: "5px", fontSize: "12px"}} key={index + "description"}>{error.description}</Typography>
                <Typography sx={{lineHeight: "14px", marginBottom: "5px", fontSize: "12px"}} key={index + "errors"}>{error.lineNumbers}</Typography>
            </Box>
        </Button>
    ))}
</Stack> {/* Copilot generated - END */}


            </Box>

            <Box variant="body1"  color="#000000" bgcolor="#FFF8E6"
                 sx={{borderRadius: 4, flexGrow: 1, flexDirection: "column", marginTop: "10px", marginBottom: "10px",}}>

                {(code.split("\n")).map((line, index) => (
                <Stack direction="row" sx={{justifyContent: "center"}}>
                    <code style={{backgroundColor: "#FFDD85", color: "#000000", textAlign: "center", width:
                            ((((code.split("\n")).length.toString().length * 10) + 10) + "px"), borderTopLeftRadius :
                            (index === 0 ? "15px" : 0), borderBottomLeftRadius :
                            ((index === ((code.split("\n")).length-1)) ? "15px" : 0),
                            paddingTop : (index === 0) ? "10px" : 0,
                            paddingBottom : (index === ((code.split("\n")).length-1)) ? "10px" : 0}}>{index+1}</code>
                    <Button fullWidth style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "0px",
                        textTransform: "none",
                        color: "black",
                        alignItems: "flex-start",
                        textAlign: "left",
                        paddingLeft: "10px",
                        paddingRight: "10px",
                        paddingTop : (index === 0) ? "10px" : 0,
                        borderTopLeftRadius : "0px",
                        borderBottomLeftRadius : "0px",
                        paddingBottom : (index === ((code.split("\n")).length-1)) ? "10px" : 0,
                        borderTopRightRadius : (index === 0 ? "15px" : "0px"),
                        borderBottomRightRadius : ((index === ((code.split("\n")).length-1)) ? "15px" : "0px"),
                        backgroundColor : (index === 6) ? "#FF000050" : "#FFF8E6"
                    }}>
                        <code>{highlightAndFormatWhitespace(line, "js")}</code>

                    </Button>

                </Stack>
            ))}
                </Box>



            <Stack>
                <Stack direction="row">


                    {(loggedIn) && (
                        <TextField fullWidth id="outlined-basic" label="Message" variant="outlined"
                                   InputProps={{style: {borderRadius: 10, marginBottom: 15}}}
                                   onChange={message_input => {
                                       handleInput(message_input.target.value);
                                   }}
                                   onKeyDown={key => {
                                       if (key.key === "Enter") {
                                           sendMessage()
                                       }
                                   }}/>
                    )}
                </Stack>
            </Stack>
            {/*<Stack>*/}
            {/*    {*/}
            {/*        messages.map((message, index) => (*/}
            {/*            <>*/}
            {/*                <Stack direction="row" key={index}>*/}
            {/*                    <Box sx={{flexGrow: 1}} p={2}>*/}
            {/*                        <Stack direction="row" sx={{alignItems: "center"}}>*/}
            {/*                            <h2>{message[0]}</h2>*/}
            {/*                            <Typography variant="body1" sx={{paddingLeft: 1}}>{message[1]}</Typography>*/}
            {/*                        </Stack>*/}
            {/*                        <p>{message[2]}</p>*/}
            {/*                        <h6>{message[3]}</h6>*/}
            {/*                    </Box>*/}
            {/*                </Stack>*/}
            {/*            </>*/}
            {/*        ))*/}
            {/*    }*/}
            {/*</Stack>*/}
        </div>
    )
}

export default Content