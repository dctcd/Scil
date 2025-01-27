import React, {useContext} from 'react'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {Box, Button, Modal, Stack, TextField, Typography, useTheme} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import axios from "axios";
import scilLogo from './resources/Scil.svg';
import {ProjectContext, TabContext} from "./App";
import NavDropdown from 'react-bootstrap/NavDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import MenuIcon from "@mui/icons-material/Menu";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const instance = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 100000,
    rejectUnauthorized: false,
});

const sidebarButtonStyle = () => {

    return ({
        color: "black",
        // borderTopLeftRadius: topBorder,
        // borderTopRightRadius: topBorder,
        // borderBottomRightRadius: bottomBorder,
        // borderBottomLeftRadius: bottomBorder,
        backgroundColor: "#FFFFFF",
        textTransform: "none",
        padding: 1.5,
        // paddingBottom: bottomBorder === 0 ? 1 : 2,
        // paddingTop: topBorder === 0 ? 1 : 2,
        // marginBottom: bottomBorder === 0 ? 0 : 2,
        // paddingBottom: 0,
        // paddingTop: topBorder === 0 ? 1 : 2,
        // '&:hover': {backgroundColor: "#F0F0F0"},
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
        padding: 2,
        '&:hover': {borderColor: "#000000", backgroundColor: "#F0F0F0"},
    });
}

const Sidebar = () => {
    const theme = useTheme();
    const {tab, setTab} = useContext(TabContext);
    const {project, setProject} = useContext(ProjectContext);
    const [addCodeVisible, setAddCodeVisibility] = React.useState(false);
    const [codeLineNumbers, setCodeLineNumbers] = React.useState("1");
    const [codeInput, setCodeInput] = React.useState("Cuir isteach do chód anseo");
    const getAnalysis = async (code) => {
        try {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
            await instance.post('/analyse', {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                },
                code: code
            })
                .then(response => {
                    response.data.analysis.code = code;
                    setProject(response.data.analysis);
                    setAddCodeVisibility(false);
                    return response.data.analysis;
                })
                .catch(e => {
                    alert(JSON.stringify(e));
                });
        } catch (e) {
            if (e instanceof Error) alert(e);
        }
        return "";
    }
    const setCodeInputAndLineNumber = (codeInput) => {
        setCodeInput(codeInput);
        let lineNumberString = "1";
        for(let i = 1; i < codeInput.split("\n").length; i++) {
            lineNumberString += "\n" + String(1+i);
        }
        setCodeLineNumbers(lineNumberString);
    }
    return (
        <Box >
            <Stack  sx={{width: "160px"}}>
                <Box display="flex" justify-content="center" align-items="center" sx={{marginBottom: "25px", paddingTop: 4, paddingLeft: 4}}>
                    <img src={scilLogo} height={35} alt="Scil"/>
                    <Typography variant="h5" sx={{marginLeft: "10px"}}>Scil</Typography>
                </Box>
                <NavDropdown
                    title={<span style={{display: "inline-block",overflow:"hidden", whiteSpace:"nowrap", textOverflow: "ellipsis", maxWidth: "120px", marginLeft: "10px", marginRight: "2px"}}>Project name goes here</span>}

                >

              <NavDropdown.Item href="#action/3.1"><span style={{display: "inline-block",overflow:"hidden", whiteSpace:"nowrap", textOverflow: "ellipsis", maxWidth: "125px"}}>Project name goes here</span></NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                <span style={{display: "inline-block",overflow:"hidden", whiteSpace:"nowrap", textOverflow: "ellipsis", maxWidth: "125px"}}>Project name goes here</span>
              </NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3"><span style={{
                        display: "inline-block",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        maxWidth: "125px"
                    }}>Project name goes here</span></NavDropdown.Item>
                    <NavDropdown.Divider/>
                    <NavDropdown.Item href="#action/3.4" onClick={() => {
                        setAddCodeVisibility(true);
                        setTab("Project")
                    }}>
                        <span style={{
                            display: "inline-block",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            maxWidth: "125px"
                        }}>+  Add Project</span>
                    </NavDropdown.Item>
                </NavDropdown>
                <Box p={2}>
                    <Box display="flex" align-items="center" style={{marginBottom: (window.innerWidth >= theme.breakpoints.values.md ? "3px" : "10px")}}>
                    <div style={{
                        display: "inline-block",
                        width: "2px",
                        background: tab === "Home" ? "#000000" : "#00000000",
                        marginTop: "2px",
                        marginBottom: "2px"
                    }}></div>
                    <Button startIcon={<HomeOutlinedIcon/>} sx={sidebarButtonStyle()}
                            disableElevation size="large" onClick={() => setTab("Home")}>
                        <Typography variant="body1">Home</Typography>
                    </Button>
                </Box>
                <Box display="flex" align-items="center" style={{marginBottom: (window.innerWidth >= theme.breakpoints.values.md ? "3px" : "10px")}}>
                    <div style={{
                        display: "inline-block",
                        width: "2px",
                        background: tab === "Team" ? "#000000" : "#00000000"
                    }}></div>
                    <Button startIcon={<GroupsOutlinedIcon/>} sx={sidebarButtonStyle()}
                            disableElevation size="large" onClick={() => setTab("Team")}>
                        <Typography variant="body1">Team</Typography>
                    </Button>
                </Box>
                <Box display="flex" align-items="center" style={{marginBottom: (window.innerWidth >= theme.breakpoints.values.md ? "3px" : "10px")}}>
                    <div style={{
                        display: "inline-block",
                        width: "2px",
                        background: tab === "code" ? "#000000" : "#00000000"
                    }}></div>
                    <Button startIcon={<CodeOutlinedIcon/>} sx={sidebarButtonStyle()}
                            disableElevation size="large" onClick={() => setTab("Code")}>
                        <Typography variant="body1">Code</Typography>
                    </Button>
                </Box>
                <Box display="flex" align-items="center" style={{marginBottom: (window.innerWidth >= theme.breakpoints.values.md ? "3px" : "10px")}}>
                    <div style={{
                        display: "inline-block",
                        width: "2px",
                        background: tab === "Settings" ? "#000000" : "#00000000"
                    }}></div>
                    <Button startIcon={<SettingsOutlinedIcon/>} sx={sidebarButtonStyle()}
                            disableElevation size="large" onClick={() => setTab("Settings")}>
                        <Typography variant="body1">Settings</Typography>
                    </Button>
                </Box>
                <Box display="flex" align-items="center" style={{marginBottom: (window.innerWidth >= theme.breakpoints.values.md ? "3px" : "10px")}}>
                    <div style={{
                        display: "inline-block",
                        width: "2px",
                        background: tab === "About" ? "#000000" : "#00000000"
                    }}></div>
                    <Button startIcon={<InfoOutlinedIcon/>} sx={sidebarButtonStyle()}
                            disableElevation size="large" onClick={() => setTab("About")}>
                        <Typography variant="body1">About</Typography>
                    </Button>
                </Box>
                <Box display="flex" align-items="center" margin="3px" marginTop="15px">
                    <div style={{
                        display: "inline-block",
                        width: "2px",
                        background: tab === "Project" ? "#000000" : "#00000000"
                    }}></div>
                    <Button startIcon={<AddIcon/>} sx={sidebarButtonStyle()}
                            disableElevation size="large" onClick={() => {
                        setAddCodeVisibility(true);
                        setTab("Project")
                    }}>
                        <Typography variant="body1">Project</Typography>
                    </Button>
                </Box>
                <Modal
                    open={addCodeVisible}
                    onClose={() => {
                        setAddCodeVisibility(false)
                    }}
                    aria-labelledby="parent-modal-title-1"
                    style={{display: "flex", alignItems: "center", justifyContent: "center"}}
                >
                    <Box variant="body1"  color="black" bgcolor="#F8F8F8"
                         sx={{borderRadius: 4, marginBottom: 2
                             // maxWidth: window.innerWidth >= theme.breakpoints.values.md ? "calc(60vh - 150px)" : "calc(100vh - 20px)"  < TODO , minWidth: 400, flex:1, flexShrink:2
                    }}>
                        <Stack>
                            <Typography style={{margin:"12px"}} variant="h6" p={1}>Insert Code for Analysis</Typography>
                {/*            <Button startIcon={<MenuIcon/>} type="submit" sx={{*/}
                {/*    display: 'flex',*/}
                {/*    color: "black",*/}
                {/*    borderRadius: 4,*/}
                {/*    backgroundColor: "#FFF8E6",*/}
                {/*    textTransform: "none",*/}
                {/*    padding: 2,*/}
                {/*    flex: 1,*/}
                {/*    '&:hover': {backgroundColor: "#F0F0F0"},*/}
                {/*    alignItems: "center",*/}
                {/*    margin: "5px",*/}
                {/*    flexGrow: 1,*/}
                {/*    flexDirection: "row",*/}
                {/*    justifyContent: "flex-start"*/}
                {/*}}*/}
                {/*        disableElevation size="large" // onClick={() => setSidebarOpen(true)}*/}
                {/*            >*/}
                {/*    <img src={scilLogo} height={30} style={{marginRight: "10px"}} alt="Scil"/>*/}
                {/*    <Typography variant="h5">Scil</Typography>*/}
                {/*</Button>*/}
                {/*            <Button startIcon={<AddIcon/>} type="submit" variant="outlined" sx={loginButton()}*/}
                {/*                    disableElevation size="large" onClick={() => {*/}
                {/*                getAnalysis(codeInput)*/}
                {/*            }}>*/}
                {/*                <Typography variant="body1">Add</Typography>*/}
                {/*            </Button>*/}




                            {/*<TextField multiline*/}
                            {/*           // slotProps={{inputLabel: {shrink: false,}}}*/}
                            {/*           // // https://stackoverflow.com/questions/66810623/material-ui-how-to-remove-the-transformation-of-inputlabel*/}
                            {/*           // InputProps={{style: {fontSize: "10px"}}}*/}
                            {/*           // label={codeInput ? " " : "Insert code here..."}*/}
                            {/*           sx={{*/}
                            {/*    "& .MuiOutlinedInput-root": {fontSize: "10px", borderRadius: "10px"},*/}

                            {/*    marginBottom: "15px"*/}
                            {/*}} // *** ChatGPT below****/}
                            {/*           inputProps={{*/}
                            {/*               style: {*/}
                            {/*                   resize: "both",*/}
                            {/*                   marginBottom: 15,*/}
                            {/*                   height: "200px",*/}
                            {/*                   alignContent: "flex-start",*/}
                            {/*                   textTransform: "none"*/}
                            {/*               }*/}
                            {/*           }}*/}
                            {/*           onChange={code => {*/}
                            {/*               setCodeInput(code.target.value);*/}
                            {/*           }}*/}
                            {/*/>*/}


                            {/*<Editor*/}
                            {/*    value={codeLineNumbers}*/}
                            {/*    onValueChange={() => {}}*/}
                            {/*    highlight={codeInput => highlight(codeInput, languages.js)}*/}
                            {/*    padding={10}*/}
                            {/*    style={{*/}
                            {/*    fontSize: 12,*/}
                            {/*    }}*/}
                            {/*/>*/}
                            <Box style={{maxHeight: "calc(100vh - 180px)", overflowX: "auto", whiteSpace: "nowrap"}}>
                            <Stack direction="horizontal" style={{background: "#EBEBEB", overflowY: "scroll"}}>
                                <div  style={{
                                    paddingTop: 10, paddingLeft: 5, paddingRight: 5, fontSize: 12, whiteSpace:"pre-wrap", background: "#CFCFCF"
                                    }}>{codeLineNumbers}</div>
                                <Box style={{minWidth: window.innerWidth >= theme.breakpoints.values.md ? "400px" : "calc(100vw - 60px)",
                                        maxWidth: window.innerWidth >= theme.breakpoints.values.md ? "calc(100vw - 380px)" : "calc(100vw - 60px)",
                                    whiteSpace: "nowrap"}}>
                                <Editor
                                    value={codeInput}
                                    onValueChange={codeInput => setCodeInputAndLineNumber(codeInput)}

                                    highlight={codeInput => highlight(codeInput, languages.js)}
                                    padding={10}
                                    sx={{ wordBreak: "false" }}
                                    style={{
                                    fontSize: 12,
                                        display: "inline-block", minWidth: "100%", overflowX: "visible", whiteSpace: "nowrap"
                                        // flex: 1,
                                    // flexShrink: 0,


          //                               // wordWrap: "normal",
          // // whiteSpace: "nowrap",
          // //                               overflowX: "scroll"
          //                               flexDirection: "row"
                                    }}
                                />
                                    </Box>
                            </Stack>
                            </Box>
                            <Button style={{margin:"12px"}} startIcon={<AddIcon/>} type="submit" variant="outlined" sx={loginButton()}
                                    disableElevation size="large" onClick={() => {
                                getAnalysis(codeInput)
                            }}>
                                <Typography variant="body1">Add</Typography>
                            </Button>
                        </Stack>
                    </Box>
                </Modal>
                    </Box>
            </Stack>
        </Box>
    )
}
export default Sidebar