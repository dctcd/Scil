import React, {useContext} from 'react'
import {Box, Button, Hidden, InputAdornment, Stack, TextField, Typography} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import userImage from './resources/User.svg'
import scilLogo from "./resources/Scil.svg";
import MenuIcon from "@mui/icons-material/Menu";
import {SidebarContext} from "./App"

const Header = ({title}) => {

    const {sidebarOpen, setSidebarOpen} = useContext(SidebarContext);

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
                        // open user dialogue
                    }} sx={{
                        color: "black",
                        backgroundColor: "#00000000",
                        textTransform: "none",
                        padding: 0,
                        margin: 0,
                        justifyContent: 'flex-start',
                        justifyItems: 'flex-start'
                    }}
                            disableElevation size="large">
                        <Stack direction="row">
                            <img src={userImage} height={35} alt="User" style={{paddingRight: "5px"}}/>
                            <Stack direction="column">
                                <Typography variant="subtitle2" margin={0}>User</Typography>
                                <Typography variant="caption" margin={0}>Frontend</Typography>
                            </Stack>
                        </Stack>
                    </Button>
                </Box>

            </Stack>
        </Hidden>
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