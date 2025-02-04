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
import {getLineHighlight, highlightAndFormatWhitespace, lineContainsIssue} from "./services/codeAnalysisService";



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




            <Box style={{padding: "10px", backgroundColor: "#FFDD85", borderRadius: "15px", marginTop: "15px",
            marginBottom: "10px", flexBasis: "content", width: "fit-content"}}>
                <Stack direction="row" style={{alignItems: "end"}}>
                    <Typography variant="caption" color="#00000099">{title[0].includes("/") ? title[0].substring(0, title[0].lastIndexOf("/")+1): ""}</Typography>
                    <Typography variant="title" style={{marginLeft: "2px"}}>{title[0].includes("/") ? title[0].substring(title[0].lastIndexOf("/")+1) : title[0]}</Typography>
                </Stack>
            </Box>

                <Stack direction="row" sx={{overflowX: "auto"}}> {/* Copilot generated - BEGIN*/}
    {(inputErrors).map((error, index) => (
        <Button key={index + "button"} fullWidth sx={{ borderRadius: "20px" }} style={{ background: "#FFF8E6", display: "flex", flexDirection: "row", textTransform: "none", color: "black", marginRight: "10px", alignItems: "flex-start", width: "150px", flexShrink: 0 }}>
            <Box key={index + "box"} sx={{  flexDirection: "row", alignItems: "stretch", width: "100%" }}>
                {error.type === "codeQualityIssue" ? codeQualityIssue : (error.type === "moderateIssue" ? moderateIssue : majorIssue)}
                <Typography sx={{lineHeight: "16px", marginBottom: "10px"}} key={index + "title"}>{error.title}</Typography>
                <Typography sx={{lineHeight: "14px", marginBottom: "5px", fontSize: "12px"}} key={index + "description"}>{error.description}</Typography>
                <Typography sx={{lineHeight: "14px", marginBottom: "5px", fontSize: "12px"}} key={index + "errors"}>{error.lineNumbers.toString()}</Typography>
            </Box>
        </Button>
    ))}
</Stack> {/* Copilot generated - END */}
            <Box variant="body1"  color="#000000" bgcolor="#FFF8E6"
                 sx={{borderRadius: 4, flexGrow: 1, flexDirection: "column", marginTop: "10px", marginBottom: "10px",}}>

                {(code.split("\n")).map((line, index) => (
                <Stack direction="row" sx={{justifyContent: "center"}}>
                    <code style={{backgroundColor: getLineHighlight(index+1, inputErrors, true),
                        color: lineContainsIssue(index+1, inputErrors) ? "#FFFFFF" : "#000000", textAlign: "center", width:
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
                        backgroundColor : getLineHighlight(index+1, inputErrors, false)
                    }}>
                        <code>{highlightAndFormatWhitespace(line, "js")}</code>

                    </Button>

                </Stack>
            ))}
                </Box>


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