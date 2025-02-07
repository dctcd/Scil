import {Box, Drawer, Hidden, Stack, useTheme} from "@mui/material";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Code from "./Code";
import Home from "./Home";

import React, {useEffect, createContext} from "react";

export const SidebarContext = createContext(false);
export const TabContext = createContext("Home");
export const ProjectContext = createContext({});
export const AvailableProjectsContext = createContext([]);
export const GitlabContext = createContext(false);



function App() {
    const theme = useTheme();
    const container = undefined;
    const [tab, setTab] = React.useState("Home");
    const [project, setProject] = React.useState({});
    const [availableProjects, setAvailableProjects] = React.useState([]);
    const [gitlabAuthenticated, setGitlabAuthenticated] = React.useState(false);
    const [sidebarOpen, setSidebarOpen] = React.useState(
        window.innerWidth >= theme.breakpoints.values.md
    );
    const [sidebarStyle, setSidebarStyle] = React.useState(
        window.innerWidth >= theme.breakpoints.values.md ? "persistent" : "temporary"
    );
    const handleDrawerToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleWindowSizeChange = () => {
        if (window.innerWidth >= theme.breakpoints.values.md) {
            setSidebarStyle("persistent");
            setSidebarOpen(true);
        } else {
            setSidebarStyle("temporary");
            setSidebarOpen(false);
        }
    };

    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        };
    }, []);

    return (
        <SidebarContext.Provider value={{sidebarOpen, setSidebarOpen}}>
            <TabContext.Provider value={{tab, setTab}}>
                <ProjectContext.Provider value={{project, setProject}}>
                    <AvailableProjectsContext.Provider value={{availableProjects, setAvailableProjects}}>
                        <GitlabContext.Provider value={{gitlabAuthenticated, setGitlabAuthenticated}}>
                            <div>
                                <Drawer container={container} variant={sidebarStyle} anchor="left" open={sidebarOpen}
                                    onClose={handleDrawerToggle} ModalProps={{keepMounted: true}}>
                                    <Sidebar/>
                                </Drawer>
                                <Stack direction="row">
                                    <Hidden mdDown implementation="css"> {/* TODO replace deprecated Hidden */}
                                        <Box p={2} sx={{width: "165px"}}></Box>
                                    </Hidden>
                                    <Stack flexGrow={1} flexDirection="column">
                                        <Header title={tab}/>
                                        {(tab === "Home" || tab === "About") && <Home/>}
                                        {tab === "Code" && <Code project={project}/>}
                                    </Stack>
                                </Stack>
                            </div>
                        </GitlabContext.Provider>
                    </AvailableProjectsContext.Provider>
                </ProjectContext.Provider>
            </TabContext.Provider>
        </SidebarContext.Provider>
    );
}

export default App;
