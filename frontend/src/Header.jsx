import React, {useContext, useState, useEffect} from 'react'
import {Box, Button, Hidden, InputAdornment, Modal, Stack, TextField, Typography} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import userImage from './resources/User.svg'
import gitlabImage from './resources/GitLab.svg'
import scilLogo from "./resources/Scil.svg";
import MenuIcon from "@mui/icons-material/Menu";
import {GitlabContext, SidebarContext} from "./App"
import {getAuthenticationStatus, updateGitlab, updateOpenai} from "./services/api";

const Header = ({title}) => {


    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [image, setImage] = useState(userImage);
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [gitlabPrivateKey, setGitlabPrivateKey] = useState("");
    const [gitlabError, setGitlabError] = useState("");
    const [openaiApiKey, setOpenaiApiKey] = useState("");
    const [openaiKeySetup, setOpenaiKeySetup] = useState(false);
    const [openaiError, setOpenaiError] = useState("");
    const {sidebarOpen, setSidebarOpen} = useContext(SidebarContext);
    const {gitlabAuthenticated, setGitlabAuthenticated} = useContext(GitlabContext);

    useEffect(() => {
        getAuthenticationStatus(setGitlabAuthenticated, setOpenaiKeySetup, setName, setUsername, setImage);
    }, []);

    return (<>
        <Hidden mdDown implementation="css">
            <Stack direction="row" p={1}
                   sx={{display: "flex", alignItems: "center"}}>
                <Typography sx={{flex: 1}} p="5px" variant="h5">{title}</Typography>
                <TextField startIcon={<SearchIcon/>} placeholder="Search" variant="outlined" sx={{flex: 1}}
                           InputProps={{
                               style: {
                                   background: "#FFFFFF",
                                   color: "#000000",
                                   borderRadius: 20,
                                   height: "40px",
                                   borderColor: "white"
                               }, startAdornment: (<InputAdornment position="start">
                                   <SearchIcon/>
                               </InputAdornment>)
                           }}
                />


                <Box sx={{display: "flex", alignItems: "center", flex: 1, justifyContent: "flex-end"}}
                     direction="row">
                    <Button onClick={() => {

                                if (username) {
                                    setGitlabPrivateKey("••••••••••••••••••••••••••");
                                }
                                if (openaiKeySetup) {
                                    setOpenaiApiKey("••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••");
                                }
                                setUserDialogOpen(true);
                    }} sx={{
                        color: "black",
                        backgroundColor: username ? "#FFF8E6" : "#FFDD85",
                        textTransform: "none",
                        padding: "5px",
                        borderRadius: "15px",
                        margin: 0,
                        justifyContent: 'flex-start',
                        justifyItems: 'flex-start'
                    }}
                            disableElevation size="large">
                        {(username) && (<Stack direction="row">
                            <img src={image} height={35} alt="User" style={{paddingRight: "5px", borderRadius: 17.5}} />
                            <Stack direction="column">
                                <Typography variant="subtitle2" margin={0}>{name}</Typography>
                                <Typography variant="caption" margin={0}>{username}</Typography>
                            </Stack>
                        </Stack>)}
                        {(!username) && (<>
                            <img src={gitlabImage} height={35} alt="GitLab" style={{paddingRight: "5px", borderRadius: 17.5}}/>
                            <Typography variant="subtitle1" margin={0} style={{paddingRight: "10px"}}>Login</Typography>
                        </>)}
                    </Button>
                </Box>

            </Stack>
        </Hidden>

        <Modal
            open={userDialogOpen}
            onClose={() => {
                setUserDialogOpen(false);
                setGitlabError("");
                setOpenaiError("");
            }}
            aria-labelledby="parent-modal-title-1"
            style={{display: "flex", alignItems: "center", justifyContent: "center"}}
        >
            <Box variant="body1" color="black" bgcolor="#F8F8F8"
                 sx={{borderRadius: 4, marginBottom: 2, padding: "10px"}}>
                <Stack>
                    <Typography style={{margin: "12px"}} variant="h6" p={1}>Edit User Information</Typography>
                    <Stack direction="row" style={{width: "500px", maxWidth: "calc(100vw - 40px)"}}>
                        <TextField password fullWidth id="outlined-basic" label="GitLab Private Key" variant="outlined"
                                   type="password" error={gitlabError === "Updated GitLab private token" ? false : (gitlabError !== "")}
                                value={gitlabPrivateKey}
                                   InputProps={{style: {borderRadius: 10}}}
                               onChange={gitlabKeyInput =>
                                   setGitlabPrivateKey(gitlabKeyInput.target.value)
                               }
                               />
                        <Button type="submit" variant="outlined" sx={{
                            display: 'flex',
                            color: "black",
                            borderRadius: 2.5,
                            backgroundColor: "#F8F8F8",
                            borderColor: "#BDBDBD",
                            textTransform: "none",
                            marginLeft: "10px",
                            '&:hover': {borderColor: "#000000", backgroundColor: "#F0F0F0"}
                        }}
                                disabled={gitlabPrivateKey === "" || gitlabPrivateKey === "••••••••••••••••••••••••••"}
                                disableElevation size="large" onClick={() => {
                                    updateGitlab(gitlabPrivateKey, setName, setUsername, setImage, setGitlabError, setGitlabAuthenticated);
                        }}>
                            <Typography variant="body1">Update</Typography>
                        </Button>
                    </Stack>
                    <Typography color={gitlabError !== "Updated GitLab private token" ? "red": "black"}>{gitlabError}</Typography>
                    <Stack direction="row" style={{marginTop: "15px", width: "500px", maxWidth: "calc(100vw - 40px)"}}>
                        <TextField password fullWidth id="outlined-basic" label="OpenAI API Key" variant="outlined"
                                   type="password"
                               InputProps={{style: {borderRadius: 10}}}
                                   value={openaiApiKey}
                               onChange={openaiApiKeyInput =>
                                   setOpenaiApiKey(openaiApiKeyInput.target.value)
                               }
                                   error={openaiError === "Updated OpenAI API key" ? false : (openaiError === "" ? false : true)}
                               />
                        <Button type="submit" variant="outlined" sx={{
                            display: 'flex',
                            color: "black",
                            borderRadius: 2.5,
                            backgroundColor: "#F8F8F8",
                            borderColor: "#BDBDBD",
                            textTransform: "none",
                            marginLeft: "10px",
                            '&:hover': {borderColor: "#000000", backgroundColor: "#F0F0F0"},
                        }}
                                disabled={openaiApiKey === "" || openaiApiKey === "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                                disableElevation size="large" onClick={() => {
                                    updateOpenai(openaiApiKey, setOpenaiError, setOpenaiKeySetup);
                        }}>
                            <Typography variant="body1">Update</Typography>
                        </Button>
                    </Stack>
                    <Typography color={openaiError !== "Updated OpenAI API key" ? "red": "black"}>{openaiError}</Typography>
                </Stack>
            </Box>
        </Modal>


        <Hidden mdUp implementation="css"
                sx={{display: "flex-grow", flexGrow: 1, flexDirection: "row", justifyContent: 'flex-start'}}>
            <Box display="flex" margin="3px">
                <Button startIcon={<MenuIcon/>} type="submit" sx={{
                    display: 'flex',
                    color: "black",
                    borderRadius: 4,
                    backgroundColor: "#FFF8E6",
                    textTransform: "none",
                    padding: 2,
                    flex: 1,
                    '&:hover': {backgroundColor: "#F0F0F0"},
                    alignItems: "center",
                    margin: "5px",
                    flexGrow: 1,
                    flexDirection: "row",
                    justifyContent: "flex-start"
                }}
                        disableElevation size="large" onClick={() => setSidebarOpen(true)}>
                    <img src={scilLogo} height={30} style={{marginRight: "10px"}} alt="Scil"/>
                    <Typography variant="h5">Scil</Typography>
                </Button>
            </Box>
        </Hidden>
    </>)
}
export default Header